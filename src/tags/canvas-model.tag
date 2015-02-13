<canvas-model>
    <header>
        <h3 onclick={toggle('classic')} class="active">Классическая модель</h3>
        <h3 onclick={toggle('lean')}>Бережливая модель</h3>
        <h3 onclick={toggle('iidf')}>Модель ФРИИ</h3>
    </header>
    <model></model>
    <footer>С ♥ от @kadmil</footer>
    toggle(key){
    return function(event) {
            this.children[0].update({opts:{rows:canvasModels[key]}});
            [].slice.apply(event.target.parentElement.children).forEach(function(el){el.classList.remove('active');});
            event.target.classList.add('active');
        }
    }
</canvas-model>
