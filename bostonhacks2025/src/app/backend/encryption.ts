// encryption.ts
import { MongoClient, ClientEncryption, Binary } from "mongodb";

const keyVaultNamespace = "encryption.__keyVault"; // db.collection that stores DEKs
const dataKeyAltName = "pii-key";                  // readable alias for your DEK

// Build a CSFLE-enabled client for your app DB
export async function getEncryptedMongoClient(dbName: string) {
  const uri = process.env.MONGODB_URI!;
  const localMasterKeyB64 = process.env.CSFLE_LOCAL_MASTER_KEY!;
  if (!uri || !localMasterKeyB64) {
    throw new Error("MONGODB_URI or CSFLE_LOCAL_MASTER_KEY missing");
  }

  // 1) Base client (no autoEncryption) to manage keys
  const baseClient = new MongoClient(uri);
  await baseClient.connect();

  // Ensure unique index on keyAltNames for the key vault (best practice)
  const keyVault = baseClient.db(keyVaultNamespace.split(".")[0])
                             .collection(keyVaultNamespace.split(".")[1]);
  await keyVault.createIndex({ keyAltNames: 1 }, { unique: true, partialFilterExpression: { keyAltNames: { $exists: true } } });

  // 2) Ensure we have a Data Encryption Key (DEK)
  const kmsProviders = {
    local: { key: Buffer.from(localMasterKeyB64, "base64") } // 96 bytes
  };

  const clientEncryption = new ClientEncryption(baseClient, {
    keyVaultNamespace,
    kmsProviders
  });

  // Try to find an existing DEK by alt name
  let dekDoc = await keyVault.findOne({ keyAltNames: dataKeyAltName });
  let keyId: Binary;
  if (dekDoc) {
    // If _id is already a Binary, use it. If it's an ObjectId, convert to Binary.
    if (dekDoc._id instanceof Binary) {
      keyId = dekDoc._id;
    } else if (dekDoc._id && dekDoc._id.id) {
      // Likely an ObjectId, convert to Binary (subtype 4 = UUID)
      keyId = new Binary(dekDoc._id.id, 4);
    } else {
      throw new Error('Unexpected DEK _id type in key vault');
    }
  } else {
    keyId = await clientEncryption.createDataKey("local", {
      keyAltNames: [dataKeyAltName]
    });
  }

  // 3) Schema map: which fields to encrypt + how
  //    We target budgeting_app.budgets (adjust if your DB name differs)
  const schemaMap = {
    [`${dbName}.budgets`]: {
      bsonType: "object",
      properties: {
        userId: {
          encrypt: {
            keyId: [keyId],
            bsonType: "string",
            algorithm: "AEAD_AES_256_CBC_HMAC_SHA_512-Deterministic"
          }
        },
        monthlyIncome: {
          encrypt: {
            keyId: [keyId],
            bsonType: "double",
            algorithm: "AEAD_AES_256_CBC_HMAC_SHA_512-Random"
          }
        },
        categories: {
          bsonType: "object",
          properties: {
            rent: {
              encrypt: {
                keyId: [keyId],
                bsonType: "double",
                algorithm: "AEAD_AES_256_CBC_HMAC_SHA_512-Random"
              }
            },
            food: {
              encrypt: {
                keyId: [keyId],
                bsonType: "double",
                algorithm: "AEAD_AES_256_CBC_HMAC_SHA_512-Random"
              }
            },
            bills: {
              encrypt: {
                keyId: [keyId],
                bsonType: "double",
                algorithm: "AEAD_AES_256_CBC_HMAC_SHA_512-Random"
              }
            },
            savings: {
              encrypt: {
                keyId: [keyId],
                bsonType: "double",
                algorithm: "AEAD_AES_256_CBC_HMAC_SHA_512-Random"
              }
            },
            investments: {
              encrypt: {
                keyId: [keyId],
                bsonType: "double",
                algorithm: "AEAD_AES_256_CBC_HMAC_SHA_512-Random"
              }
            },
            wants: {
              encrypt: {
                keyId: [keyId],
                bsonType: "double",
                algorithm: "AEAD_AES_256_CBC_HMAC_SHA_512-Random"
              }
            }
          }
        }
        // wantsSubcategories / timestamps left plaintext intentionally
      }
    }
  };

  // 4) Auto-encrypting client (this is the one your app should use)
  const encryptedClient = new MongoClient(uri, {
    autoEncryption: {
      keyVaultNamespace,
      kmsProviders,
      schemaMap
    }
  });

  await encryptedClient.connect();
  await baseClient.close();

  return encryptedClient;
}
