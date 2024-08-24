class Repository {
    async __load(key) {
        const result = await chrome.storage.local.get([key]);
        return result[key];
    }

    async __save(key, val) {
        await chrome.storage.local.set({[key]: val});
    }


    // orderItems : Array<{ id: string, note: string }>
    async _getOrderItems() { return await this.__load('orderItems') ?? []; }
    async _setOrderItems(items) { await this.__save('orderItems', items); }


    async query_order_info(orderId) {
        const items = await this._getOrderItems();
        for (let i = 0; i < items.length; i++) {
            if (items[i].id === orderId) {
                return items[i];
            }
        }
        return null;
    }

    async update_order_info(orderId, orderInfo) {
        const items = await this._getOrderItems();

        let found = false;
        for (let i = 0; i < items.length; i++) {
            if (items[i].id === orderId) {
                found = true;
                items[i].note = orderInfo.note ?? '';
                break;
            }
        }

        if (!found) {
            items.push({
                id: orderId,
                note: orderInfo.note ?? ''
            });
        }

        await this._setOrderItems(items);
    }
}


async function query_order_info(orderId) {
    const orderInfo = await new Repository().query_order_info(orderId);
    return orderInfo;
}

async function update_order_info(orderId, orderInfo) {
    await new Repository().update_order_info(orderId, orderInfo);
}


chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    //console.log('onMessage', message?.command, message, sender);

    const sendResponseWrapper = (result) => {
        //console.log('sendResponse', result);
        sendResponse(result);
    };

    switch (message.command)
    {
    case 'query_order_info':
        query_order_info(message.orderId).then(sendResponseWrapper);
        break;
    case 'update_order_info':
        update_order_info(message.orderId, message.orderInfo).then(sendResponseWrapper);
        break;
    }

    return true;
});
