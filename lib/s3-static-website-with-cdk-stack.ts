import * as cdk from '@aws-cdk/core';
import { RemovalPolicy } from '@aws-cdk/core';
import { Bucket, HttpMethods } from "@aws-cdk/aws-s3";
import { CloudFrontWebDistribution, OriginAccessIdentity } from "@aws-cdk/aws-cloudfront";

export class S3StaticWebsiteWithCdkStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const domainName = 'example.com'

    const bucket = new Bucket(this, 'SiteFiles', {
      publicReadAccess: true,
      removalPolicy: RemovalPolicy.DESTROY,
      websiteIndexDocument: 'index.html'
    })

    bucket.addCorsRule({
      allowedMethods: [HttpMethods.DELETE, HttpMethods.GET, HttpMethods.HEAD, HttpMethods.POST, HttpMethods.PUT],
      allowedOrigins: [domainName]
    })

    const cfOAI = new OriginAccessIdentity(this, 'AccessId', {
      comment: 'website origin access ID'
    })

    const errorConfigurations = [{
      errorCode: 404,
      responseCode: 200,
      responsePagePath: '/index.html'
    }]

    const originConfigs = [{
      s3OriginSource: {
        s3BucketSource: bucket,
        originAccessIdentity: cfOAI
      },
      behaviors: [{ isDefaultBehavior: true }]
    }]

    const distribution = new CloudFrontWebDistribution(this, 'CDN', {
      errorConfigurations,
      originConfigs
    })

    new cdk.CfnOutput(this, 'Web Address', {
      value: distribution.distributionDomainName
    })

    bucket.grantRead(cfOAI)
  }
}
