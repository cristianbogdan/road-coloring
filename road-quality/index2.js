window.addEventListener('load', () => {
    console.log('startup');
    
    document.querySelector('#btn-info').addEventListener('click', () => {
        document.querySelector('#info').showModal();
    });

    document.querySelector('#btn-close-info').addEventListener('click', () => {
        document.querySelector('#info').close();
    });

    document.querySelector('#btn-hide-legend').addEventListener('click', () => {
        document.querySelector('#legend').style.display = 'none';
    });
});