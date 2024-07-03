function showFileDetailBox() {
    document.querySelector('.main-box').style.display = 'none';
    document.querySelector('.file-detail-box').style.display = 'block';
}

function closeFileDetailBox() {
    document.querySelector('.file-detail-box').style.display = 'none';
    document.querySelector('.main-box').style.display = 'block';
}

function saveInputValues() {
    const name = document.getElementById('nameIn').value;
    const mobile = document.getElementById('mobileIn').value;
    const address = document.getElementById('addressIn').value;
    localStorage.setItem('name', name);
    localStorage.setItem('mobile', mobile);
    localStorage.setItem('address', address);
}
document.addEventListener('DOMContentLoaded', (event) => {
    // Stack to keep track of tables
    let tableStack = [];
    // Variable to keep track of the current table being edited
    let currentTable = document.getElementById('room');

    tableStack.push(currentTable);

    let confirmDeleteCell = false;
    let confirmDeleteRoom = false;

    // Function to show the delete cell alert
    document.getElementById('delCell').addEventListener('click', function(event) {
        event.preventDefault();
        document.querySelector('.alert-box.cell').style.transform = 'scale(1)';
    });

    // Function to hide the delete cell alert
    document.querySelector('.alert-box.cell .btn.close').addEventListener('click', function(event) {
        event.preventDefault();
        document.querySelector('.alert-box.cell').style.transform = 'scale(0)';
    });

    // Function to show the delete room alert
    document.getElementById('delRoom').addEventListener('click', function(event) {
        event.preventDefault();
        document.querySelector('.alert-box.room').style.transform = 'scale(1)';
    });

    // Function to hide the delete room alert
    document.querySelector('.alert-box.room .btn.close').addEventListener('click', function(event) {
        event.preventDefault();
        document.querySelector('.alert-box.room').style.transform = 'scale(0)';
    });

    // Function to add a new row (cell) in the current table
    document.getElementById('nextCell').addEventListener('click', function(event) {
        event.preventDefault();

        // Find the row to clone
        let currentRow = currentTable.querySelector('tr#cell');
        if (!currentRow) {
            console.error('No row with id "cell" found');
            return;
        }

        // Clone the row
        let newRow = currentRow.cloneNode(true);
        newRow.classList.add('table-row'); // Add the class to the new row

        // Clear the values in the cloned row
        newRow.querySelectorAll('input').forEach(input => input.value = '');

        // Append the new row to the current table
        currentTable.appendChild(newRow);

        // Move the total row to the end of the table
        let totalRow = currentTable.querySelector('tr#total');
        if (totalRow) {
            currentTable.appendChild(totalRow);
        }

        // Reinitialize the calculation listeners
        initializeCalculationListeners();
    });

    // Function to remove the last added row (cell) in the current table
    document.getElementById('backCell').addEventListener('click', function(event) {
        event.preventDefault();

        // Get all rows with the class 'table-row'
        let rows = currentTable.querySelectorAll('.table-row');
        
        // Remove the last row if there are more than one
        if (rows.length > 1) {
            rows[rows.length - 1].remove();
        }

        // Hide the delete cell alert
        document.querySelector('.alert-box.cell').style.transform = 'scale(0)';

        // Reinitialize the calculation listeners
        initializeCalculationListeners();
    });

    // Function to add a new table for a new room
    document.getElementById('nextRoom').addEventListener('click', function(event) {
        event.preventDefault();

        // Create a new room table structure
        let newRoomTable = document.createElement('table');
        newRoomTable.classList.add('table-container'); // Add the class to the new table
        newRoomTable.innerHTML = `
            <tr>
                <td><input class="roomName" type="text" placeholder="room name"></td>
            </tr>
            <tr id="cell" class="table-row">
                <td><input class="loadNam" type="text"></td>
                <td><input class="q" type="number"></td>
                <td><input class="dfl" type="number"></td>
                <td><input class="wl" type="number"></td>
                <td><input class="tw" type="number" readonly></td>
                <td><input class="al" type="number" readonly></td>
            </tr>
            <tr id="total">
                <td></td>
                <td></td>
                <td></td>
                <td>total</td>
                <td><input class="totalWatt" type="number" readonly></td>
                <td><input class="totalAmp" type="number" readonly></td>
            </tr>
        `;

        // Append the new table above the buttons
        let formElement = document.querySelector('#createFile .row');
        formElement.insertBefore(newRoomTable, formElement.querySelector('div'));

        // Push the current table to the stack
        tableStack.push(currentTable);

        // Update the current table being edited
        currentTable = newRoomTable;

        // Reinitialize the calculation listeners
        initializeCalculationListeners();
    });

    // Function to go back to the previous room
    document.getElementById('backRoom').addEventListener('click', function(event) {
        event.preventDefault();

        if (tableStack.length > 1) {
            // Remove the current table
            currentTable.remove();

            // Pop the stack and set the previous table as current
            currentTable = tableStack.pop();

            // Hide the delete room alert
            document.querySelector('.alert-box.room').style.transform = 'scale(0)';

            // Reinitialize the calculation listeners
            initializeCalculationListeners();
        }
    });

    // Function to initialize calculation listeners
    function initializeCalculationListeners() {
        const qElements = currentTable.querySelectorAll('.q');
        const pflElements = currentTable.querySelectorAll('.dfl');
        const wlElements = currentTable.querySelectorAll('.wl');
        const twElements = currentTable.querySelectorAll('.tw');
        const alElements = currentTable.querySelectorAll('.al');
        const totalWattElement = currentTable.querySelector('.totalWatt');
        const totalAmpElement = currentTable.querySelector('.totalAmp');
    
        const V = 230;
        const pf = 0.9;
    
        function calculateTotalWattAndAmp() {
            qElements.forEach((q, index) => {
                const quantity = parseFloat(q.value) || 0;
                const powerFactor = parseFloat(pflElements[index].value) || 0;
                const watt = parseFloat(wlElements[index].value) || 0;
                const totalWatt = quantity * powerFactor * watt;
                twElements[index].value = totalWatt.toFixed(2);
    
                const amp = (totalWatt / (V * pf)).toFixed(2);
                alElements[index].value = amp;
            });
    
            calculateTotalWatt();
            calculateTotalAmp();
        }
    
        function calculateTotalWatt() {
            let totalWatt = 0;
            twElements.forEach(tw => {
                totalWatt += parseFloat(tw.value) || 0;
            });
            totalWattElement.value = totalWatt.toFixed(2);
        }
    
        function calculateTotalAmp() {
            let totalAmp = 0;
            alElements.forEach(al => {
                totalAmp += parseFloat(al.value) || 0;
            });
            totalAmpElement.value = totalAmp.toFixed(2);
        }
    
        qElements.forEach((q, index) => {
            q.addEventListener('input', calculateTotalWattAndAmp);
            pflElements[index].addEventListener('input', calculateTotalWattAndAmp);
            wlElements[index].addEventListener('input', calculateTotalWattAndAmp);
        });
    
        // Initialize calculation on page load
        calculateTotalWattAndAmp();
    }
    
    // Initialize calculation listeners for the default table
    initializeCalculationListeners();
});
document.addEventListener('DOMContentLoaded', () => {
    const name = localStorage.getItem('name');
    const mobile = localStorage.getItem('mobile');
    const address = localStorage.getItem('address');

    if (name) {
        document.getElementById('name').value = name;
    }
    if (mobile) {
        document.getElementById('mobile').value = mobile;
    }
    if (address) {
        document.getElementById('address').value = address;
    }
});