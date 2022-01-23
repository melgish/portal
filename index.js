import { createHash, randomBytes } from "node:crypto";
import ldap from "ldapjs";

const connect = () => ldap.createClient({ url: 'ldap://ldap.lan:1389' });

/**
 *
 * @param {string} dn
 * @param {string} password
 * @returns {ldap.Client}
 */
const bind = (dn, password) => new Promise((resolve, reject) => {
  const client = connect();
  client.bind(dn, password, (err, data) => {
    if (err) {
      console.log('bind failure', err);
      return reject(err);
    }
    console.log('bound', dn);
    return resolve(client);
  });
});

/**
 *
 * @param {ldap.Client} client
 * @returns
 */
const unbind = (client) => new Promise((resolve, reject) => {
  client.unbind((err,data) => {
    if (err) {
      console.log('unbind failure', err);
      return reject(err);
    }
    console.log('unbound');
    return resolve(data);
  });
});

const ssha = (password, salt) => {
salt = salt ?? randomBytes(24).toString("base64");
  // In testing the encoding must be latin1 (binary) or bind will fail
  const digest = createHash("sha1")
    .update(password, 'utf-8')
    .update(salt, 'latin1')
    .digest('latin1');
  const salty = Buffer.from(digest +  salt, 'latin1').toString('base64');
  return `{SSHA}${salty}`;
};

/**
 *
 * @param {ldap.Client} client
 * @param {string} dn
 * @param {string} password
 * @returns
 */
const changePassword = (client, dn, password) => {
  return new Promise((resolve, reject) => {
    const change = new ldap.Change({
      operation: 'replace',
      modification: { userPassword: ssha(password) }
    });
    client.modify(dn, change, (err, data) => {
      if (err) {
        console.log('modify failure', err);
        return reject(err);
      }
      console.log('modified');
      return resolve(data);
    });
  });
}

const admin = await bind('cn=admin,dc=njfiorello,dc=com', 'fruitFly');
await changePassword(admin, 'cn=ben,ou=users,dc=njfiorello,dc=com', 'dr@gon1');
await unbind(admin);

const user = await bind('cn=ben,ou=users,dc=njfiorello,dc=com', 'dr@gon1');
await changePassword(user, 'cn=ben,ou=users,dc=njfiorello,dc=com', 'dr@gon1');
await unbind(user);

// const dn = 'cn=ben,ou=users,dc=njfiorello,dc=com';
// const mod = await new Promise((resolve, reject) => {
//   console.log('modify');
//   client.modify(dn, change, (err, data) => {
//     if (err) {
//       console.log('err', err);
//       return reject(err);
//     }
//     resolve(data);
//   });
// });


// await new Promise((resolve) => client.unbind(resolve));

// const test = await new Promise((resolve, reject) => {
//   console.log("test");
// 	client.bind(dn, "#Password1", (err, data) => {
// 		if (err) {
//       console.log('err', err);
// 			return reject(err);
// 		}
//     console.log('test', data);
// 		resolve(data);
// 	});
// });

// await new Promise((resolve) => {
//   client.destroy();
//   console.log('done');
//   resolve();
// });