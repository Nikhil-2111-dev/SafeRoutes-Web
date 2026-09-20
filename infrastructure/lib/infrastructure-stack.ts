import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as location from 'aws-cdk-lib/aws-location';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as events from 'aws-cdk-lib/aws-events';
import * as targets from 'aws-cdk-lib/aws-events-targets';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as cognito from 'aws-cdk-lib/aws-cognito';
import * as path from 'path';

export class InfrastructureStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // 1. Amazon Location Maps
    const map = new location.CfnMap(this, 'SafeRouteMap', {
      mapName: 'SafeRouteMap',
      configuration: { style: 'VectorEsriNavigation' },
      description: 'Map for SafeRoute application'
    });

    // 2. Amazon Location Places
    const placeIndex = new location.CfnPlaceIndex(this, 'SafeRoutePlaceIndex', {
      indexName: 'SafeRoutePlaceIndex',
      dataSource: 'Esri',
    });

    // 3. Amazon Location Routes
    const routeCalculator = new location.CfnRouteCalculator(this, 'SafeRouteCalculator', {
      calculatorName: 'SafeRouteCalculator',
      dataSource: 'Esri',
    });

    // 4. Amazon Location Geofence Collection
    const geofenceCollection = new location.CfnGeofenceCollection(this, 'SafeRouteDangerZones', {
      collectionName: 'SafeRouteDangerZones',
      description: 'Collection of danger zones'
    });

    // 5. Amazon Location Tracker
    const tracker = new location.CfnTracker(this, 'SafeRouteLocationTracker', {
      trackerName: 'SafeRouteLocationTracker',
      positionFiltering: 'DistanceBased'
    });

    // 6. DynamoDB Tables
    const usersTable = new dynamodb.Table(this, 'SafeRouteUsers', {
      tableName: 'SafeRouteUsers',
      partitionKey: { name: 'userId', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });
    const pinsTable = new dynamodb.Table(this, 'SafeRoutePins', {
      tableName: 'SafeRoutePins',
      partitionKey: { name: 'id', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });
    
    // New Table for Hybrid Community Safety System
    const incidentsTable = new dynamodb.Table(this, 'SafeRouteIncidents', {
      tableName: 'SafeRouteIncidents',
      partitionKey: { name: 'incidentId', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    const alertsTable = new dynamodb.Table(this, 'SafeRouteAlerts', {
      tableName: 'SafeRouteAlerts',
      partitionKey: { name: 'alertId', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });
    const sosTable = new dynamodb.Table(this, 'SafeRouteSOS', {
      tableName: 'SafeRouteSOS',
      partitionKey: { name: 'sosId', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });



    const contactsTable = new dynamodb.Table(this, 'SafeRouteContacts', {
      tableName: 'SafeRouteContacts',
      partitionKey: { name: 'PK', type: dynamodb.AttributeType.STRING },
      sortKey: { name: 'SK', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    const processGeofenceEnter = new lambda.Function(this, 'ProcessGeofenceEnterLambda', {
      runtime: lambda.Runtime.NODEJS_22_X,
      handler: 'index.handler',
      code: lambda.Code.fromAsset(path.join(__dirname, '../lambdas/processGeofenceEnter')),
      environment: {
        PINS_TABLE_NAME: pinsTable.tableName,
        ALERTS_TABLE_NAME: alertsTable.tableName,
      }
    });

    processGeofenceEnter.addToRolePolicy(new iam.PolicyStatement({
      actions: ['bedrock:InvokeModel'],
      resources: ['*'], // Need specific Bedrock model ARN in production
    }));
    pinsTable.grantReadData(processGeofenceEnter);
    alertsTable.grantWriteData(processGeofenceEnter);

    // 8. EventBridge Rules
    const geofenceEnterRule = new events.Rule(this, 'LocationGeofenceEnterRule', {
      eventPattern: {
        source: ['aws.geo'],
        detailType: ['Location Geofence Event'],
        detail: {
          EventType: ['ENTER']
        }
      }
    });
    geofenceEnterRule.addTarget(new targets.LambdaFunction(processGeofenceEnter));

    // 9. Amazon Cognito Auth
    const userPool = new cognito.UserPool(this, 'SafeRouteUserPool', {
      userPoolName: 'SafeRouteUserPool',
      selfSignUpEnabled: true,
      signInAliases: { email: true },
      autoVerify: { email: true },
      standardAttributes: {
        fullname: { required: true, mutable: true },
        phoneNumber: { required: true, mutable: true },
      }
    });

    // Add a Cognito Domain for Hosted UI (Required for Google Auth)
    const userPoolDomain = userPool.addDomain('SafeRouteDomain', {
      cognitoDomain: {
        domainPrefix: 'saferoute-auth-' + this.account,
      },
    });

    const userPoolClient = new cognito.UserPoolClient(this, 'SafeRouteWebClient', {
      userPool,
      userPoolClientName: 'SafeRouteWebClient',
      authFlows: {
        userPassword: true,
        userSrp: true
      },
      oAuth: {
        callbackUrls: ['http://localhost:3000/dashboard'],
        logoutUrls: ['http://localhost:3000/login'],
        flows: {
          implicitCodeGrant: true,
        },
      }
    });

    // Outputs for the frontend
    new cdk.CfnOutput(this, 'UserPoolId', { value: userPool.userPoolId });
    new cdk.CfnOutput(this, 'UserPoolClientId', { value: userPoolClient.userPoolClientId });
  }
}
