/**
 * @desc this block of code will read the file form the input and create an <img> element in the DOM to preview it.
 */
document.getElementById('formFile').addEventListener('change', (e) => {
	console.log(e.target.files);
	const file = e.target.files[0];
	if (file) {
		const reader = new FileReader();
		reader.onload = function (e) {
			const img = document.createElement('img');
			img.src = e.target.result;
			img.classList.add('mt-2');
			document.getElementById('img-preview').innerHTML = ''; // Clear previous image
			document.getElementById('img-preview').appendChild(img);
		};
		reader.readAsDataURL(file);
	}
});
