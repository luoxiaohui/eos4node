# eos4node

通过node服务的方式，与区块链测试网络交互。

## QuickStart

```bash
$ npm i
$ npm run dev
```

创建账户(如果报错，请更改username)
```
curl -i -X POST http://localhost:7001/account/create -d username=brcontract11 -d active=EOS6ZoY56kkjceFBQDb1r7tk4QuxcQRth9eT5AjirZAJPsMBDPbi1 -d owner=EOS6ZoY56kkjceFBQDb1r7tk4QuxcQRth9eT5AjirZAJPsMBDPbi1
```
部署合约
```
curl -i -X POST http://localhost:7001/deployContract -d contract=blockr111111
```
创建代币，并分发代币给初始账户
```
curl -i -X POST http://localhost:7001/createCurrency -d contract=blockr111111
```
产生批量普通账户
```
curl -i -X POST http://localhost:7001/batchCreateAccount
```
转账
```
curl -i -X POST http://localhost:7001/transfer -d contract=blockr111111 -d from=brpool111111 -d to=1s3kv4ayft1r -d pk=5JzMg5v5dNpQP7mF1HrQCB92Mp5BBQd2yN5MvMrQevzkWPwxiFf -d quantity="10000.0000 BLR" -d mome="register reward"
```
获取代币余额
```
curl -i -X POST http://localhost:7001/currency/balance -d contract=blockr111111 -d account=1s3kv4ayft1r
```


测试浏览器查看交易记录
```
https://party.eosmonitor.io/account/blockr111111
```


