const AWS = require('aws-sdk');

const init = () => {
  //TODO: Verificar se o credential.json existes
  AWS.config.loadFromPath('./cred.json');
}

// Set the region
const setRegion = (region) => {
  AWS.config.update({region: region});
}

const setCredentials = (cred) => {
  AWS.config.update({ Credentials: cred });
}

module.exports = { AWS, init, setRegion, setCredentials }
