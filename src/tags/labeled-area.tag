<labeled-area>
            <label for="area">{opts.label}</label>
            <textarea id="area" onfocus={handler} onblur={handler}></textarea>
            handler(event){
             event.target.parentNode.classList.toggle('md-whiteframe-z3');
         }
</labeled-area>