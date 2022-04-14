import * as iam from 'aws-cdk-lib/aws-iam';
import * as cdk from 'aws-cdk-lib';

export class CdkStarterStack extends cdk.Stack {
  constructor(scope: cdk.App, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // 👇 Create a Policy Document (Collection of Policy Statements)
    const filterLogEvents = new iam.PolicyDocument({
      statements: [
        new iam.PolicyStatement({
          resources: ['arn:aws:logs:*:*:log-group:/aws/lambda/*'],
          actions: ['logs:FilterLogEvents'],
          // 👇 Default for `effect` is ALLOW
          effect: iam.Effect.ALLOW,
        }),
      ],
    });

    // 👇 Create role, to which we'll attach our Policies
    const role = new iam.Role(this, 'example-iam-role', {
      assumedBy: new iam.ServicePrincipal('lambda.amazonaws.com'),
      description: 'An example IAM role in AWS CDK',
      inlinePolicies: {
        FilterLogEvents: filterLogEvents,
      },
    });

    // 👇 Create an AWS Managed Policy
    const managedPolicy = iam.ManagedPolicy.fromAwsManagedPolicyName(
      'service-role/AWSLambdaBasicExecutionRole',
    );

    // 👇 attach the Managed Policy to the role
    role.addManagedPolicy(managedPolicy);

    // 👇 Create a Policy using the generic Construct
    const putLogEventsPolicy = new iam.Policy(this, 'cw-logs', {
      statements: [
        new iam.PolicyStatement({
          actions: ['logs:PutLogEvents'],
          resources: ['*'],
        }),
      ],
    });

    // 👇 attach the Policy to the role
    role.attachInlinePolicy(putLogEventsPolicy);

    // 👇 Create a Policy Statement
    const createLogStreams = new iam.PolicyStatement({
      actions: ['logs:CreateLogGroup', 'logs:CreateLogStream'],
      resources: ['*'],
    });

    // 👇 Attach policy to Role
    role.addToPolicy(createLogStreams);
  }
}
