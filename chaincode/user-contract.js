'use strict';

const { Contract } = require('fabric-contract-api');

class PropertyRegistrationUser extends Contract {

    constructor() {
        // Name of the smart contract
        super('propertyRegistration.user');
    }

    async instantiate(ctx) {
        console.log('Smart Contract for User Instantiated');
    }

    // requestNewUser
    async requestNewUser(ctx, name, email, phone, socialSecurity) {
        const requestUserKey = ctx.stub.createCompositeKey('propertyRegistration.requestedUsers', [socialSecurity, name]);
        const userObject = {
            docType: 'requestedUser',
            name: name,
            email: email,
            phone: phone,
            socialSecurity: socialSecurity,
            createdAt: ctx.stub.getTxTimestamp(),
        }
        // Convert the JSON object to a buffer and send it to blockchain for storage
        let dataBuffer = Buffer.from(JSON.stringify(userObject));
        await ctx.stub.putState(requestUserKey, dataBuffer);

        // Return value of new account created to user
        return userObject;
    }
    
    // rechargeAccount
    async rechargeAccount(ctx, name, socialSecurity, transactionId) {

        const transactions = {
            'upg100': 100,
            'upg500': 500,
            'upg1000': 1000,
        }
        const userKey = ctx.stub.createCompositeKey('propertyRegistration.users', [socialSecurity, name]);
        const userbuffer = await ctx.stub.getState(userKey);

        if (userbuffer) {
            const userObject = JSON.parse(userbuffer.toString());
            userObject.upgradCoins = transactions[transactionId] ? transactions[transactionId] : userObject.upgradCoins;

            // Convert the JSON object to a buffer and send it to blockchain for storage
            let dataBuffer = Buffer.from(JSON.stringify(userObject));
            await ctx.stub.putState(userKey, dataBuffer);

            // Return value of new account created to user
            return userObject;

        } else {
            return 'There is no user with above social security number'
        }

    }
    // viewUser
    async viewUser(ctx, socialSecurity, name) {
        const userKey = ctx.stub.createCompositeKey('propertyRegistration.users', [socialSecurity, name]);
        const userbuffer = await ctx.stub.getState(userKey);

        if (userbuffer) {
            const userObject = JSON.parse(userbuffer.toString());
            return userObject;

        } else {
            return 'There is no user with above social security number'
        }
    }

    // propertyRegistrationRequest
    async propertyRegistrationRequest(ctx, propertyId, price, status, socialSecurity, name) {
        const ownerKey = ctx.stub.createCompositeKey('propertyRegistration.users', [socialSecurity, name]);
        const userbuffer = await ctx.stub.getState(ownerKey);
        if (userbuffer) {
            const propertyRequestKey = ctx.stub.createCompositeKey('propertyRegistration.requestedProperties', [propertyId]);
            const propertyObject = {
                docType: 'requestedProperty',
                propertyId: propertyId,
                price: price,
                status: status,
                owner: ownerKey,
            }

            // Convert the JSON object to a buffer and send it to blockchain for storage
            let dataBuffer = Buffer.from(JSON.stringify(propertyObject));
            await ctx.stub.putState(propertyRequestKey, dataBuffer);
    
            // Return value of new account created to user
            return propertyObject;
        } else {
            return 'There is no user with above social security number'
        }
    }

   
    // updateProperty
    async updateProperty(ctx, propertyId, status, socialSecurity, name) {
        const ownerKey = ctx.stub.createCompositeKey('propertyRegistration.users', [socialSecurity, name]);
        const propertyKey = ctx.stub.createCompositeKey('propertyRegistration.properties', [propertyId]);
        const propertyBuffer = await ctx.stub.getState(propertyKey);
        if (propertyBuffer) {
            const property = JSON.parse(propertyBuffer.toString())
            if (property.owner === ownerKey) {
                property.status = status;
                // Convert the JSON object to a buffer and send it to blockchain for storage
                let dataBuffer = Buffer.from(JSON.stringify(property));
                await ctx.stub.putState(propertyKey, dataBuffer);

                // Return value of new account created to user
                return propertyObject;
            } else {
                return 'You are not allowed to update this property'
            }
        } else {
            return 'There is no property with above propertyId'
        }
    }
    // purchaseProperty
    async purchaseProperty(ctx, propertyId, socialSecurity, name) {
        const ownerKey = ctx.stub.createCompositeKey('propertyRegistration.users', [socialSecurity, name]);
        const userbuffer = await ctx.stub.getState(ownerKey);
        if (userbuffer) {
            const propertyKey = ctx.stub.createCompositeKey('propertyRegistration.properties', [propertyId]);
            const propertyBuffer = await ctx.stub.getState(propertyKey);

            if (propertyBuffer) {
                const property = JSON.parse(propertyBuffer.toString());
                if (property.status === 'onSale') {
                    const user = JSON.parse(userbuffer.toString());
                    
                    if (user.upgradCoins >= property.price) {
                        const lastOwnerBuffer = ctx.stub.getState(property.owner)
                        const lastOwner = JSON.parse(lastOwnerBuffer.toString());
                        lastOwner.upgradCoins = lastOwner.upgradCoins + property.price;
                        // Convert the JSON object to a buffer and send it to blockchain for storage
                        let lastOwnerdataBuffer = Buffer.from(JSON.stringify(propertyObject));
                        await ctx.stub.putState(property.owner, lastOwnerdataBuffer);


                        const newOwnerBuffer = ctx.stub.getState(ownerKey);
                        const newOwner = JSON.parse(newOwnerBuffer.toString());
                        newOwner.upgradCoins = newOwner.upgradCoins - property.price;
                        // Convert the JSON object to a buffer and send it to blockchain for storage
                        let newOwnerdataBuffer = Buffer.from(JSON.stringify(propertyObject));
                        await ctx.stub.putState(ownerKey, newOwnerdataBuffer);



                        property.owner = ownerKey;
                        property.status = 'registered';
                        // Convert the JSON object to a buffer and send it to blockchain for storage
                        let dataBuffer = Buffer.from(JSON.stringify(property));
                        await ctx.stub.putState(propertyKey, dataBuffer);
            
                        // Return value of new account created to user
                        return property;
                    } else {
                        return 'You dont have enough upgrade coins to purchase this property'
                    }
    
                } else {
                    return 'This Property is not available for sale'
                }
            } else {
                return 'There is no property with above propertyId'
            }

        } else {
            return 'There is no user with above social security number'
        }
    }
}

module.exports = PropertyRegistrationUser;
