#!/bin/bash

# get the current directory of the script
INSTALLER_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

echo $INSTALLER_DIR
mkdir -p $INSTALLER_DIR/../running/static
mkdir -p $INSTALLER_DIR/../running/runtime
mkdir -p $INSTALLER_DIR/../running/attachment
mkdir -p $INSTALLER_DIR/../running/kshare

KEY=`node $INSTALLER_DIR/genCryptoKey.cjs`
echo $KEY

tee  $INSTALLER_DIR/../setenv.sh <<EOF
#!/bin/bash
export HAPI_HOST="0.0.0.0"
export HAPI_PORT=12008
export MONGO_CONNECTION_STRING="mongodb://127.0.0.1:27017/apm_emp_dev?readPreference=secondaryPreferred&directConnection=true&serverSelectionTimeoutMS=2000"
export REDIS_CONNECTION_STRING="redis://default:foobared@127.0.0.1:6379"
export CRYPTO_PRIVATE_KEY="${KEY}"
export CRYPTO_EXPIRE=60
export SMTP_HOST="smtp.your-domain.com"
export SMTP_PORT=465
export SMTP_USERNAME="smtp_user"
export SMTP_PASSWORD="smtp_password"
export SMTP_FROM="admin_email"
export SITE_ADMIN="site admin email"
export SITE_ADMIN_PASSWORD="site admin password"
export ZEROMQ_SERVER="127.0.0.1"
export ZEROMQ_PORT=3000

export NODE_TLS_REJECT_UNAUTHORIZED=1;
export NODE_ARGS=""

export APM_LOCAL_REPOSITORY_DIR=${INSTALLER_DIR}/../.apm

EOF

chmod +x  $INSTALLER_DIR/../setenv.sh
