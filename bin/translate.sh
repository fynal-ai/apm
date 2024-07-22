#!/bin/bash
if ! command -v opencc &> /dev/null
then
    echo "opencc is not installed. Please install opencc to continue."
    exit 1
fi

BAYSTONE=$HOME/dev/baystone
opencc -i $BAYSTONE/frt/src/lib/lang/zh-CN.json -o $BAYSTONE/frt/src/lib/lang/zh-TW.json -c $BAYSTONE/tools/opencc/config/s2twp.json
opencc -i $BAYSTONE/frt/src/lib/lang/zh-CN.json -o $BAYSTONE/frt/src/lib/lang/zh-HK.json -c $BAYSTONE/tools/opencc/config/s2hk.json
opencc -i $BAYSTONE/frt/src/lib/lang/zh-TW.json -o $BAYSTONE/frt/src/lib/lang/jp.json -c $BAYSTONE/tools/opencc/config/t2jp.json
