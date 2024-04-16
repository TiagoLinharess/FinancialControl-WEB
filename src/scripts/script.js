/*
  --------------------------------------------------------------------------------------
  Funçaão para formatar moeda.
  --------------------------------------------------------------------------------------
*/

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
    .then((response) => {
        if (response.status >= 400) {
            return response.text()
            .then(error => {
                const errorJson = JSON.parse(error);
                throw new Error(errorJson.error);
            })
        }
        return response.json();
    })
    .then((data) => {
        insertBillItems(data);
        cancelItemForm();
    })
    .catch((error) => {
      presentError(error);
    });
}

/*
  --------------------------------------------------------------------------------------
  Request para salvar contas.
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
        if (response.status >= 400) {
            return response.text()
            .then(error => {
                const errorJson = JSON.parse(error);
                throw new Error(errorJson.error);
            })
        }
        fetchBillItems();
    })
    .catch((error) => {
        presentError(error);
    });
}


/*
  --------------------------------------------------------------------------------------
  Request para salvar contas.
  --------------------------------------------------------------------------------------
*/

const putBillItem = async (id, name, type, value) => {
    const formData = new FormData();
    formData.append('id', id);
    formData.append('name', name);
    formData.append('type', type);
    formData.append('value', value);

    let url = 'http://127.0.0.1:5000/bill_items';
    fetch(url, {
      method: 'put',
      body: formData
    })
    .then((response) => {
        if (response.status >= 400) {
            return response.text()
            .then(error => {
                const errorJson = JSON.parse(error);
                throw new Error(errorJson.error);
            })
        }
        fetchBillItems();
    })
    .catch((error) => {
        presentError(error);
    });
}

/*
  --------------------------------------------------------------------------------------
  Request para deletar contas.
  --------------------------------------------------------------------------------------
*/

const deleteBillItem = async (id) => {
    const formData = new FormData();
    formData.append('id', id);
  
    let url = 'http://127.0.0.1:5000/bill_items';
    fetch(url, {
      method: 'delete',
      body: formData
    })
    .then((response) => {
        if (response.status >= 400) {
            return response.text()
            .then(error => {
                const errorJson = JSON.parse(error);
                throw new Error(errorJson.error);
            })
        }
        fetchBillItems();
    })
    .catch((error) => {
        presentError(error);
    });
}

/*
  --------------------------------------------------------------------------------------
  Função para apresentar erro.
  --------------------------------------------------------------------------------------
*/

const presentError = async (error) => {
    alert(error);
}

/*
  --------------------------------------------------------------------------------------
  Função para inserir os anos.
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

/*
  --------------------------------------------------------------------------------------
  Função para inserir os meses.
  --------------------------------------------------------------------------------------
*/

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

/*
  --------------------------------------------------------------------------------------
  Funções para inserir as contas.
  --------------------------------------------------------------------------------------
*/

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

        createItemsText(item.id, item.name, item.value, itemDiv);
    });
}

const createItemsText = async (id, text, value, itemDiv) => {
    const name = text.charAt(0).toUpperCase() + text.slice(1);
    const textHTML = document.createElement("text");
    textHTML.className = "item-name";
    textHTML.innerHTML = name + " | " + BRLCurrency.format(value);
    itemDiv.appendChild(textHTML);

    const buttonDiv = document.createElement("div");
    buttonDiv.className = "item-button-div";
    itemDiv.appendChild(buttonDiv);

    createEditButton(id, itemDiv, buttonDiv);
    createDeleteButton(id, buttonDiv);
}

/*
  --------------------------------------------------------------------------------------
  Função para criar botão de edição.
  --------------------------------------------------------------------------------------
*/

const createEditButton = async (id, itemDiv, buttonDiv) => {
    const editButton = document.createElement("button");
    editButton.innerHTML = "Editar"
    editButton.className = "edit-btn"
    editButton.addEventListener("click", (e) => {
        createEditForm(id, itemDiv, buttonDiv);
    });
    buttonDiv.appendChild(editButton);
}

/*
  --------------------------------------------------------------------------------------
  Função para criar form de edição.
  --------------------------------------------------------------------------------------
*/

const createEditForm = async (id, itemDiv, buttonDiv) => {
    NodeList.prototype.forEach = Array.prototype.forEach
    buttonDiv.style.display = "none";

    const section = document.getElementById("form-section");
    const clone = section.cloneNode(true);
    clone.className = "edit-item";
    clone.style.display = "flex";

    clone.childNodes.forEach(child => {
        if (child.id === "year-input" || child.className === "add-btn-div" || child.className === "new-item-title") {
            child.remove();
        } else if (child.className === "select-div") {
            child.childNodes.forEach(node => {
                if (node.id === "month-input") {
                    child.remove();
                } else if (node.id === "type-input") {
                    node.value = "";
                    node.id = `${id}-edit-${node.id}`;
                }
            });
        } else {
            child.value = "";
            child.id = `${id}-edit-${child.id}`;
        }

        child.className = "input-edit";
    });
    itemDiv.appendChild(clone);
    createEditFormFinishButton(id, clone);
    createEditCancelButton(clone, buttonDiv);
}

/*
  --------------------------------------------------------------------------------------
  Função para botão de finalizar form de edição.
  --------------------------------------------------------------------------------------
*/

const createEditFormFinishButton = async (id, cloneDiv) => {
    const editButton = document.createElement("button");
    editButton.innerHTML = "Salvar"
    editButton.className = "edit-finish-btn"
    editButton.addEventListener("click", (e) => {
        editBillItem(id);
    });
    cloneDiv.appendChild(editButton);
}

/*
  --------------------------------------------------------------------------------------
  Função para criar botão de cancelar edição.
  --------------------------------------------------------------------------------------
*/

const createEditCancelButton = async (cloneDiv, buttonDiv) => {
    const deleteButton = document.createElement("button");
    deleteButton.innerHTML = "Cancelar"
    deleteButton.className = "delete-btn"
    deleteButton.addEventListener("click", (e) => {
        buttonDiv.style.display = "block";
        cloneDiv.remove();
    });
    cloneDiv.appendChild(deleteButton);
}

/*
  --------------------------------------------------------------------------------------
  Função para criar botão de deleção.
  --------------------------------------------------------------------------------------
*/

const createDeleteButton = async (id, itemDiv) => {
    const deleteButton = document.createElement("button");
    deleteButton.innerHTML = "Deletar"
    deleteButton.className = "delete-btn"
    deleteButton.addEventListener("click", (e) => {
        deleteBillItem(id);
    });
    itemDiv.appendChild(deleteButton);
}

/*
  --------------------------------------------------------------------------------------
  Lógica para adicionar conta.
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
  Lógica para adicionar formulário da conta.
  --------------------------------------------------------------------------------------
*/
const addBillItemForm = () => {
    const formSection = document.getElementById("form-section");
    const btnFormSection = document.getElementById("btn-form-section");


    formSection.style.display = "flex";
    btnFormSection.style.display = "none";
}

/*
  --------------------------------------------------------------------------------------
  Lógica para cancelar formulário da conta.
  --------------------------------------------------------------------------------------
*/
const cancelItemForm = () => {
    const formSection = document.getElementById("form-section");
    const btnFormSection = document.getElementById("btn-form-section");

    document.getElementById("year-input").value = "";
    document.getElementById("month-input").value = "";
    document.getElementById("name-input").value = "";
    document.getElementById("type-input").value = "";
    document.getElementById("value-input").value = "";

    formSection.style.display = "none";
    btnFormSection.style.display = "flex";
}

/*
  --------------------------------------------------------------------------------------
  Lógica para editar conta.
  --------------------------------------------------------------------------------------
*/
const editBillItem = (id) => {
    const name = document.getElementById(`${id}-edit-name-input`).value;
    const value = document.getElementById(`${id}-edit-value-input`).value;

    const typeHTML = document.getElementById(`${id}-edit-type-input`);
    const type = typeHTML.value;

    putBillItem(id, name, type, value);
}