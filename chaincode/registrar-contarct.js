'use strict';

const { Contract } = require('fabric-contract-api');

class PropertyRegistrationRegistrar extends Contract {

    constructor() {
        // Name of the smart contract
        super('propertyRegistration.registrar');
    }
    async instantiate(ctx) {
        console.log('Smart Contract for User Instantiated');
    }
    // approveNewUser
    async approveNewUser(ctx, name, socialSecurity) {
        const requestUserKey = ctx.stub.createCompositeKey('propertyRegistration.requestedUsers', [socialSecurity, name]);
        const userbuffer = await ctx.stub.getState(requestUserKey);
        if (userbuffer) {
            const userKey = ctx.stub.createCompositeKey('propertyRegistration.users', [socialSecurity, name]);
            const userObject = JSON.parse(userbuffer.toString());
            userObject.docType = 'user';
            userObject.upgradCoins = 0;

            // Convert the JSON object to a buffer and send it to blockchain for storage
            let dataBuffer = Buffer.from(JSON.stringify(userObject));
            await ctx.stub.putState(userKey, dataBuffer);

            // Return value of new account created to user
            return userObject;

        } else {
            return 'There is no requested user with above social security number'
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

    // approvePropertyRegistration
    async approvePropertyRegistration(ctx, propertyId) {
        const propertyRequestKey = ctx.stub.createCompositeKey('propertyRegistration.requestedProperties', [propertyId]);
        const propertyBuffer = await ctx.stub.getState(propertyRequestKey);
        if (propertyBuffer) {
            const requestedProperty = JSON.parse(propertyBuffer.toString());
            const propertyKey = ctx.stub.createCompositeKey('propertyRegistration.properties', [propertyId]);
            // Convert the JSON object to a buffer and send it to blockchain for storage
            let dataBuffer = Buffer.from(JSON.stringify(requestedProperty));
            await ctx.stub.putState(propertyKey, dataBuffer);

            // Return value of new account created to user
            return propertyObject;
        } else {
            return 'There is no property with above propertyId'
        }

    }
   
}

module.exports = PropertyRegistrationRegistrar;
