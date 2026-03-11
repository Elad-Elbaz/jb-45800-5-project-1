type Expense = {
    tpe: string,
    Describe: string,
    price: number,
    when: string,
    otherDescribe: string
}


let data: Expense[] = []

// Load data from LocalStorage
function loadFromLocalStorage() {
    const saved = localStorage.getItem('products');
    if (saved) {
        const parsed: Expense[] = JSON.parse(saved);
        data.push(...parsed);
        putDataOnTable();
    }

}

// Save data to LocalStorage
function saveToLocalStorage() {
    localStorage.setItem('products', JSON.stringify(data));

}

function nav() {

    document.getElementById('navigation')!.innerHTML =
        `<a class = nav href="home.html">home</a>
<a class = nav href="expenses-filter.html">filters</a>
<a class = nav href="graphs.html"> graphs</a>
<a class = nav href="about.html">about</a>`
}

function resetForm() {
    (document.getElementById('resetForm') as HTMLFormElement).reset();
    document.getElementById('Expense_type')!.focus();
}


function deleteProduct(index: number) {
    if (confirm("Are you sure you want to delete this product?")) {
        data.splice(index, 1);
        saveToLocalStorage();
        putDataOnTable();
    }
}

function editProduct(index: number) {
    const { tpe, Describe, price, when, otherDescribe } = data[index]!;
    (document.getElementById('Expense_type') as HTMLSelectElement).value = tpe;
    (document.getElementById('Expense_Describe') as HTMLTextAreaElement).value = Describe;
    (document.getElementById('price') as HTMLInputElement).value = price.toString();
    (document.getElementById('when') as HTMLInputElement).value = when;
    (document.getElementById('other_Describe') as HTMLInputElement).value = otherDescribe;
    data.splice(index, 1);
    saveToLocalStorage();
    putDataOnTable();
}
function getUserInputs(event: Event) {
    event.preventDefault()
    const tpe = (document.getElementById('Expense_type') as HTMLSelectElement).value
    const Describe = (document.getElementById('Expense_Describe') as HTMLTextAreaElement).value
    const price = (document.getElementById('price') as HTMLInputElement).value
    const when = (document.getElementById('when') as HTMLInputElement).value
    const otherDescribe = (document.getElementById('other_Describe') as HTMLInputElement).value

    if (tpe === 'other' && !otherDescribe) {
        alert('if you chose - other, you must describe it')
        return;
    }
    // prevent input of a future date
    const today = (new Date()).toLocaleDateString('en-CA')
    if (when > today) {
        alert('you must not enter a date in the future...')
        return;
    }

    data.push({
        tpe,
        Describe,
        price: +price,
        when,
        otherDescribe,

    })




    putDataOnTable();
    saveToLocalStorage();
    resetForm();

}

function putDataOnTable() {
    const container = document.getElementById('body') as HTMLElement
    if (!container) return
    container.innerHTML =
        data.map(({ tpe, Describe, price, when, otherDescribe, }, i) =>

            `
    <tr> 
    <td> ${tpe} </td>
    <td>${Describe} </td>
    <td>${otherDescribe} </td> 
    <td>${price} </td>
    <td>${when} </td> 
    <td><button onclick="deleteProduct(${i})">delete</button></td>
        <td><button onclick="editProduct(${i})">update</button></td>

    </tr>
    ` )
            .join('')



}

function filterTable(filterdata: Expense[]) {

    const container = document.getElementById('body') as HTMLElement
    if (!container) return
    container.innerHTML =
        filterdata.map(({ tpe, Describe, otherDescribe, price, when }) =>
            `
    <tr> 
            <td>${tpe}</td>
            <td>${Describe}</td>
            <td>${otherDescribe || ''}</td> 
            <td>${price}</td>
            <td>${when}</td> 
        </tr>
    `)
            .join('');
}


const filterByYear = () => {
    const year = (document.getElementById('year') as HTMLSelectElement).value
    filterTable(data.filter(dte => dte.when.startsWith(year)))

}
const filterByMonth = () => {
    const month = (document.getElementById('month') as HTMLInputElement).value
    filterTable(data.filter(dte => dte.when.startsWith(month)))

}

const filterByDay = () => {
    const day = (document.getElementById('day') as HTMLInputElement).value
    filterTable(data.filter(dte => dte.when.startsWith(day)))

}
const filterByPrice = () => {
    const max = (document.getElementById('priceInput') as HTMLInputElement).value
    filterTable(data.filter(dte => dte.price <= +max))
}
const clearAllFilters = () => {
    filterTable(data)

    const yearInput = document.getElementById('year') as HTMLSelectElement | null;
    if (yearInput) {
        yearInput.value = 'select a year';
        (document.getElementById('month') as HTMLInputElement).value = '';
        (document.getElementById('day') as HTMLInputElement).value = '';
        (document.getElementById('priceInput') as HTMLInputElement).value = '';
    }
}

const getPieData = () => {
    const categories = ['food', 'gas', 'spare time', 'authorities', 'other']

    return categories.map(cat => {
        const matchingExpenses = data.filter(exp => exp.tpe === cat)
        return matchingExpenses.reduce((sum, exp) => sum + exp.price, 0)
    });
};

const getBarData = () => {
    const years = ['2022', '2023', '2024', '2025', '2026'];

    return years.map(y => {
        const matchingExpenses = data.filter(exp => exp.when.startsWith(y))
        return matchingExpenses.reduce((sum, exp) => sum + exp.price, 0)
    })
}

declare const Chart: any;
const drawCharts = () => {
    new Chart(document.getElementById('pieChart')!, {
        type: 'pie',
        data: {
            labels: ['Food', 'Gas', 'Spare Time', 'Authorities', 'Other'],
            datasets: [{
                data: getPieData()
            }]
        }
    })

    new Chart(document.getElementById('barChart')!, {
        type: 'bar',
        data: {
            labels: ['2022', '2023', '2024', '2025', '2026'],
            datasets: [{
                label: 'Total Expenses by Year',
                data: getBarData()
            }]
        }
    })
}


const downloadCSV = () => {
    const headers = "Expense Type,Description,Other Description,Price,Date\n";
    const rows = data.map(exp =>
        `${exp.tpe},${exp.Describe},${exp.otherDescribe || ''},${exp.price},${exp.when}`
    ).join("\n");

    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = "Expenses_Report.csv"
    link.click()
}
declare const html2pdf: any;
const downloadPDF = () => {
    const report = document.getElementById('reportContainer') as HTMLElement
    html2pdf().from(report).save('Expenses_Report.pdf')
}