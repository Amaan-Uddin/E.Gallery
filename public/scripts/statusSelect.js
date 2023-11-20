document.querySelectorAll('.dropdown-item').forEach((item) => {
	item.addEventListener('click', (e) => {
		const selectedOption = e.target.getAttribute('data-value');
		document.getElementById('selected-option').value = selectedOption;
		document.getElementById('dropdownMenuButton').innerText = e.target.innerText;
	});
});
