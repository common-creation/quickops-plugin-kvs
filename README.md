# quickops-plugin-kvs

[QuickOps](https://quickops.sh)のビルドタスクで使用できるキーバリューストアの[lscbuild](https://github.com/common-creation/lscbuild)プラグイン

## 使い方

`Linux コンテナ` と `Windows コンテナ` で共通です

```yaml
version: 1
jobs:
  example:
    steps:

      # some other steps ...

      - use: common-creation/quickops-plugin-kvs#main
        env:
          - QUICKOPS_KVS_MODE=SET
          - QUICKOPS_KVS_KEY=TEST_KEY
          - QUICKOPS_KVS_VALUE=foobar

      - use: common-creation/quickops-plugin-kvs#main
        env:
          - QUICKOPS_KVS_MODE=GET
          - QUICKOPS_KVS_KEY=TEST_KEY

      - cmd: echo $TEST_KEY
```

## 環境変数

| キー | 挙動 | 必須 | デフォルト値 |
| ---- | ---- | ---- | ---- |
| QUICKOPS_KVS_MODE | プラグインの動作モード。 GET or SET | ✅ | - |
| QUICKOPS_KVS_KEY | キーバリューストアのキー | ✅ | - |
| QUICKOPS_KVS_VALUE | キーバリューストアの値。 `QUICKOPS_KVS_MODE=SET` の場合は必須。 `$` で始まる場合は、その環境変数を指定できる | - | - |
| QUICKOPS_KVS_ENVNAME | 環境変数にエクスポートする際の環境変数名。  | - | `$QUICKOPS_KVS_KEY` |
