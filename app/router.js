'use strict';

/**
 * create by 380226205@qq.com
 * @param {*} app 
 */
module.exports = app => {

    const { router, controller } = app;

    /**
     * 创建代币
     */
    router.post('/createCurrency', controller.home.createCurrency);

    /**
     * 分发初始代币
     */
    router.post('/distributeToken', controller.home.distributeToken);

    /**
     * 批量生成账户
     * {
     * count 数量   
     * } 
     */
    router.post('/batchCreateAccount', controller.home.batchCreateAccount);

    /**
     * 创建账户
     * @param {post body} 
     * {
     * username 账户名,
     * owner    onwer公钥,
     * active   active公钥
     * } 
     */
    router.post('/account/create', controller.home.createAccountApi);

    /**
     * 查询账户余额
     * @param {post body} 
     * {
     * contract 账户合约,
     * account  需要查询的账户
     * } 
     */
    router.post('/currency/balance', controller.home.getCurrencyBalance);

    /**
     * 部署合约
     * @param {post body} 
     * {
     * seed 种子
     * } 
     */
    router.post('/deployContract', controller.home.deployContract);

    /**
     * 转账
     * @param {post body} 
     * {
     * to 转给账户,
     * quantity 币种
     * mome 备注
     * } 
     */
    router.post('/transfer', controller.home.transfer);

};