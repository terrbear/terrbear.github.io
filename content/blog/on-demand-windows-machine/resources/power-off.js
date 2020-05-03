const AWS = require("aws-sdk");

const instanceId = process.env.INSTANCE_ID;

const ec2 = new AWS.EC2();

exports.handler = () => {
  const params = {
    InstanceIds: [instanceId]
  };
  return ec2.stopInstances(params).promise();
};