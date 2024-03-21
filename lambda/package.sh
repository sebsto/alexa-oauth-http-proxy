#!/bin/bash

ZIP_NAME=hostname_lambda_function.zip
zip -r $ZIP_NAME index.js node_modules/*
aws s3 cp $ZIP_NAME s3://alexademo.ninja/httpproxy/
