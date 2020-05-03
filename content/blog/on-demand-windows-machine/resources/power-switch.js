const AWS = require("aws-sdk");

const instanceId = process.env.INSTANCE_ID;

const ec2 = new AWS.EC2();

const checkIfRunning = async () => {
  const response = await ec2
    .describeInstances({ InstanceIds: [instanceId] })
    .promise();
  return response.Reservations[0].Instances[0].State.Name !== "stopped";
};

exports.handler = async () => {
  const params = {
    InstanceIds: [instanceId]
  };

  const running = await checkIfRunning();

  if (running) {
    return ec2.stopInstances(params).promise();
  }

  return ec2.startInstances(params).promise();
};