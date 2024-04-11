const BRLCurrency = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
});

/*
  --------------------------------------------------------------------------------------
  Request para obter as contas.
  --------------------------------------------------------------------------------------
*/
const fetchBillItems = async () => {
    let url = 'http://127.0.0.1:5000/bill_items';
    fetch(url, {
        method: 'get',
    })
    .then((response) => response.json())
    .then((data) => {
        console.log(data)
        insertBillItems(data);
    })
    .catch((error) => {
      console.error('Error:', error);
    });
}

/*
  --------------------------------------------------------------------------------------
  Lógica para inserir as contas.
  --------------------------------------------------------------------------------------
*/
const insertBillItems = async (data) => {
    const content = document.getElementById("content");
    while (content.lastElementChild) {
        content.removeChild(content.lastElementChild);
    }

    data.years.forEach(year => {
        const div = document.createElement("div");
        div.id = year.id;
        div.className = "year-div"
        content.appendChild(div);

        const h3 = document.createElement("h3");
        h3.className = "year-title";
        h3.innerHTML = year.year;
        div.appendChild(h3);
        insertMonths(year.months, div);
    });
}

const insertMonths = async (months, yearDiv) => {
    months.forEach(month => {
        const monthDiv = document.createElement("div");
        monthDiv.id = month.id;
        monthDiv.className = "month-div";
        yearDiv.appendChild(monthDiv);

        const h4 = document.createElement("h4");
        h4.className = "month-title";
        h4.innerHTML = month.month.charAt(0).toUpperCase() + month.month.slice(1) + ":";
        monthDiv.appendChild(h4);
        insertItems(month.incomes, monthDiv, "income", month.id);
        insertItems(month.outcomes, monthDiv, "outcome", month.id);
    });
}

const insertItems = async (items, monthDiv, title, monthId) => {
    if (items.length == 0) return

    const sectionDiv = document.createElement("div");
    sectionDiv.id = title + "-" + monthId;
    sectionDiv.className = "section-div";
    monthDiv.appendChild(sectionDiv);

    const h4 = document.createElement("h4");
    h4.className = "section-title";
    h4.innerHTML = title == "income" ? "Entradas:" : "Saídas:"
    sectionDiv.appendChild(h4)

    items.forEach(item => {
        const itemDiv = document.createElement("div");
        itemDiv.id = item.id;
        itemDiv.className = "item-div";
        sectionDiv.appendChild(itemDiv);

        createItemsText(item.name, item.value, itemDiv);
    });
}

const createItemsText = async (text, value, itemDiv) => {
    const name = text.charAt(0).toUpperCase() + text.slice(1);
    const textHTML = document.createElement("text");
    textHTML.className = "item-name";
    textHTML.innerHTML = name + " | " + BRLCurrency.format(value);
    itemDiv.appendChild(textHTML);
}

/*
  --------------------------------------------------------------------------------------
  Adicionar conta.
  --------------------------------------------------------------------------------------
*/
const addBillItem = () => {
    const year = document.getElementById("year-input").value;
    const name = document.getElementById("name-input").value;
    const value = document.getElementById("value-input").value;

    const monthHTML = document.getElementById("month-input");
    const month = monthHTML.value;

    const typeHTML = document.getElementById("type-input");
    const type = typeHTML.value;

    postBillItem(year, month, name, type, value);
}


/*
  --------------------------------------------------------------------------------------
  Função para colocar um item na lista do servidor via requisição POST
  --------------------------------------------------------------------------------------
*/
const postBillItem = async (year, month, name, type, value) => {
    const formData = new FormData();
    formData.append('year', year);
    formData.append('month', month);
    formData.append('name', name);
    formData.append('type', type);
    formData.append('value', value);
  
    let url = 'http://127.0.0.1:5000/bill_items';
    fetch(url, {
      method: 'post',
      body: formData
    })
      .then((response) => {
        fetchBillItems();
      })
      .catch((error) => {
        console.error('Error:', error);
      });
  }