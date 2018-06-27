'use strict';

const Controller = require('egg').Controller;
const fs = require('fs');
const Eos = require('eosjs');
const ecc = require('eosjs-ecc');
const binaryen = require('binaryen');

/**
 * 私钥
 */
// const pk = '5KQwrPbwdL6PhXujxW37FSSQZ1JiwsST4cqQzDeyXtP79zkvFD3';
const pk = '5JzMg5v5dNpQP7mF1HrQCB92Mp5BBQd2yN5MvMrQevzkWPwxiFf';
// const pk = '5JyFbtvRHZEep2tYTj244vwiqrVSRT9heNhd7UZHJGhavUwJRAg';
// var pk = '';

/**
 * eos服务
 */
const eosServer = 'http://178.62.196.196:8888';
// const eosServer = 'http://seed.party.tc.ink:8888';
// const eosServer = 'http://127.0.0.1:8888';


/**
 * 主账户
 */
const mainAccount = 'blockrent111';

/**
 * 给用户抵押的数量-用于网络使用
 */
const stake_net_quantity = '10.0000 SYS';

/**
 * 给用户抵押的数量-用于cpu使用
 */
const stake_cpu_quantity = '10.0000 SYS';

// var eos;

const eos = Eos({
    binaryen,
    keyProvider: [pk],
    chainId: 'cec278a9dced800d9a695adc1e265ed11efa0ad8a70cdaac1eb65718bbe2434f',
    httpEndpoint: eosServer
});

/**
 * 错误返回
 * @param {错误信息} error 
 */
const error = (error = 'error') => {
    return { code: '500', msg: error, data: {} }
}

/**
 * 成功返回
 * @param {数据} data 
 */
const success = (data) => {
    return { code: '000', msg: 'success', data: data }
}

/**
 * 创建账户
 */
function createAccount(userName, ownerKey, activeKey) {
    console.log('调用创建账户函数。。。。')
    return new Promise(function(resolve, reject) {
        eos.transaction(tr => {
            tr.newaccount({
                creator: mainAccount,
                name: userName,
                owner: ownerKey,
                active: activeKey
            })
            tr.buyrambytes({
                payer: mainAccount,
                receiver: userName,
                bytes: 8000
            })
            tr.delegatebw({
                from: mainAccount,
                receiver: userName,
                stake_net_quantity: stake_net_quantity,
                stake_cpu_quantity: stake_cpu_quantity,
                transfer: 0
            })
        }).then(result => {

            console.log('账户' + userName + '生成成功')
            if (result) {
                resolve(success(result))
            } else {
                reject(error())
            }
        }).catch(e => {

            console.log('账户' + userName + '生成失败')
            console.log(e)
                // reject(error('账户' + userName + '生成失败'))
        });
    })
};

/**
 * 随机产生账户
 */
function randomString(len) {　　
    len = len || 32;　　
    var $chars = 'qwertyuiopasdfghjklzxcvbnm12345';　　
    var maxPos = $chars.length;　　
    var account = '';　　
    for (var i = 0; i < len; i++) {
        account += $chars.charAt(Math.floor(Math.random() * maxPos));　　
    }　　
    return account;
}

/*
 * 将请求任务串行化
 */
function sequenceTasks(tasks) {
    function recordValue(results, value) {
        results.push(value);
        return results;
    }
    var pushValue = recordValue.bind(null, []);
    return tasks.reduce(function(promise, task) {
        return promise.then(task).then(pushValue);
    }, Promise.resolve());
}

/**
 * create by 380226205@qq.com
 */
class HomeController extends Controller {

    /*
     * 创建4个账户按比例分配10亿个代币
     * inviteAccount 定向邀约机构方
     * teamAccount 团队及基金会
     * communityAccount 社区培养及推广
     * poolAccount 激励池
     */
    async distributeToken() {
        const { ctx } = this;
        // 首先创建部署合约需要的账户和密钥对 
        let publicKey = ecc.privateToPublic(pk);
        let params = ctx.request.body;
        if (!params.inviteAccount || !params.teamAccount ||
            !params.communityAccount || !params.poolAccount) {
            this.ctx.body = error('参数错误');
            return;
        }

        await Promise.all([
                createAccount(params.inviteAccount, publicKey, publicKey), //定向邀约机构方
                createAccount(params.teamAccount, publicKey, publicKey), //团队及基金会
                createAccount(params.communityAccount, publicKey, publicKey), //社区培养及推广
                createAccount(params.poolAccount, publicKey, publicKey), //激励池
            ])
            .then(function(resolveData) {

                ctx.body = success('账户生成成功.');
            }, function(rejectData) {
                ctx.body = error(rejectData)
            });
    }

    /*
     * 批量生成普通用户的账户
     */
    async batchCreateAccount() {
        const { ctx } = this;
        let params = ctx.request.body;
        let count = 5; //默认生成10个账户
        if (params.count) {
            count = params.count;
        }

        // let seed = randomString(30)
        // let privateKey = ecc.seedPrivate(seed);
        let publicKey = ecc.privateToPublic(pk);
        var arrayObj = new Array()
        for (var i = 0;; i++) {

            var account = randomString(12)
            await createAccount(account, publicKey, publicKey).then(function(resolveData) {

                arrayObj.push(account)
            }, function(rejectData) {

                console.log('rejectData--->', rejectData)
            });
            if (arrayObj.length > count) {

                ctx.body = success(arrayObj);
                return;
            }
        }
    }

    /**
     * 创建账户
     * username 账户名
     * active 账户的activeKey
     * owner 账户的ownerKey
     */
    async createAccountApi() {
        const { ctx } = this;
        try {
            let params = ctx.request.body;
            if (!params.username || !params.active || !params.owner) {
                this.ctx.body = error('参数错误');
                return;
            }
            await eos.transaction(tr => {
                tr.newaccount({
                    creator: mainAccount,
                    name: params.username,
                    owner: params.owner,
                    active: params.active
                })
                tr.buyrambytes({
                    payer: mainAccount,
                    receiver: params.username,
                    bytes: 8192
                })
                tr.delegatebw({
                    from: mainAccount,
                    receiver: params.username,
                    stake_net_quantity: stake_net_quantity,
                    stake_cpu_quantity: stake_cpu_quantity,
                    transfer: 0
                })
            }).then(result => {
                if (result) {
                    ctx.body = success(result);
                } else {
                    ctx.body = error();
                }
            }).catch(e => {
                ctx.body = error(e);
            });
        } catch (e) {
            ctx.body = error(e);
        }
    }

    /*
     * 部署合约
     * contract 部署合约的用户
     */
    async deployContract() {
        const { ctx } = this;
        let params = ctx.request.body;
        if (!params.contract) {
            this.ctx.body = error('参数错误');
            return;
        }
        const wasm = await fs.readFileSync(`app/eosio.token/eosio.token.wasm`)
        const abi = await fs.readFileSync(`app/eosio.token/eosio.token.abi`)

        eos.setcode(params.contract, 0, 0, wasm)
        eos.setabi(params.contract, JSON.parse(abi))

        await eos.getCode(params.contract).then(result => {

            ctx.body = success(result);
        }).catch(e => {

            console.log('部署合约错误log--->', e)
            ctx.body = error(e);
        });

    }

    /*
     * 创建代币
     * contract 部署合约的账户
     */
    async createCurrency() {

        const { ctx } = this
        let params = ctx.request.body;
        if (!params.contract) {
            this.ctx.body = error('参数错误');
            return;
        }
        await eos.transaction(params.contract, myaccount => {

            // 创建代币
            myaccount.create(params.contract, '1000000000.0000 BLR', { authorization: params.contract })
                // 分发代币，这里issue有且只能有一个...
            myaccount.issue(params.contract, '1000000000.0000 BLR', 'issue', { authorization: params.contract })

        }).then(result => {
            console.log('代币创建成功。。。')
            if (result) {
                ctx.body = success(result)
            } else {
                ctx.body = error()
            }
        }).catch(e => {
            console.log('代币创建失败。。。', e)
            ctx.body = error(e)
        });
    }

    /**
     * 查询余额
     * contract 部署合约的账户
     * account 需要查询的账户
     */
    async getCurrencyBalance() {

        const { ctx } = this;
        try {
            let params = ctx.request.body;
            if (!params.contract || !params.account) {
                ctx.body = error('参数错误');
                return;
            }
            await eos.getCurrencyBalance(params.contract, params.account).then(result => {
                if (result) {
                    ctx.body = success(result);
                } else {
                    ctx.body = error();
                }
            });
        } catch (e) {
            ctx.body = error(e);
        }
    }

    /**
     * 转账
     * contract 部署合约的账户
     * from 转账用户
     * to 转到哪个用户
     * pk 转账用户的私钥
     * quantity 转的代币金额
     * mome 转账描述
     */
    async transfer() {
        const { ctx } = this;
        try {
            let params = ctx.request.body;
            console.log('准备转账...')
            console.log(params)
            if (!params.contract || !params.from || !params.pk || !params.to || !params.quantity || !params.mome) {
                this.ctx.body = error('参数错误');
                return;
            }
            await eos.transaction(params.contract, myaccount => {
                    myaccount.transfer({ from: params.from, to: params.to, quantity: params.quantity, memo: params.mome })
                })
                .then((r) => {
                    this.ctx.body = success(r);
                }).catch((e) => {
                    this.ctx.body = error(e);
                });
        } catch (e) {
            this.ctx.body = error(e);
        }
    }
}

module.exports = HomeController;