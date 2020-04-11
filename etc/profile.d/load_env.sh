#!/bin/bash

REGION=`curl -s http://169.254.169.254/latest/dynamic/instance-identity/document|grep region|awk -F\" 'print $4'`

get_instance_tags () 
    instance_id=$(/usr/bin/curl --silent http://169.254.169.254/latest/meta-data/instance-id)
    echo $(/usr/local/bin/aws ec2 describe-tags --filters "Name=resource-id,Values=$instance_id" --region=$REGION)


get_ami_tags () 
    ami_id=$(/usr/bin/curl --silent http://169.254.169.254/latest/meta-data/ami-id)
    echo $(/usr/local/bin/aws ec2 describe-tags --filters "Name=resource-id,Values=$ami_id" --region=$REGION)


tags_to_env ()  /usr/bin/jq -r ".[][] 

ami_tags=$(get_ami_tags)
instance_tags=$(get_instance_tags)

tags_to_env "$ami_tags"
tags_to_env "$instance_tags"