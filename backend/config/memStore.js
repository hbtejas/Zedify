/**
 * Shared in-memory user store
 * Used by authController and authMiddleware when MongoDB is not connected
 */

// email.toLowerCase() → user object
const memUsers = new Map();

/**
 * Look up a user by their UUID id field
 */
const findUserById = (id) => {
  for (const user of memUsers.values()) {
    if (user._id === id) return user;
  }
  return null;
};

module.exports = { memUsers, findUserById };
