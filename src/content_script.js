async function onAccountPage() {
    const header = document.querySelector('.AccountTable > thead > tr');
    const th = document.createElement('th');
    th.textContent = 'メモ';
    header.appendChild(th);

    const orders = Array.from(document.querySelectorAll('.AccountTable > tbody > tr'));
    for (let i = 0; i < orders.length; i++) {
        const order = orders[i];
        const orderId = order.querySelector('td:nth-of-type(1) > a').textContent.trim();
        const td = document.createElement('td');
        const ta = document.createElement('textarea');

        const orderInfo = await chrome.runtime.sendMessage({command: 'query_order_info', orderId: orderId});
        ta.value = orderInfo?.note ?? '';
        ta.style.width = '100%';
        ta.style.height = '5em';
        ta.onchange = async (ev) => {
            const note = ev.target.value;
            await chrome.runtime.sendMessage({command: 'update_order_info', orderId: orderId, orderInfo: {note: note}});
        };
        ta.style.backgroundColor='#dffaff';
        ta.onfocus = (ev) => {
            ev.target.style.backgroundColor='#ffffcc';
        };
        ta.onblur = (ev) => {
            ev.target.style.backgroundColor='#dffaff';
        };

        td.style.padding='5px 0';

        td.appendChild(ta);
        order.appendChild(td);
    }

    // オマケ. ページネーションの現在のページ番号を目立たせる
    document.querySelector('.Pagination_dot.isActive').style.color = '#4f9fef';
}

async function main() {
    const pageUrl = new URL(location.href);

    if (pageUrl.pathname === '/account' || pageUrl.pathname === '/account/') {
        // マイアカウントページにメモ欄を追加
        await onAccountPage();
    }
}

main();
