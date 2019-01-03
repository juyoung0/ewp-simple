/*
    created date : 04/01/2018
    purpose : show detail view drawing
    note: object on the image
 */

export class DetailComponent{
    constructor(props) {
        //<img src={Img} width="100%" height="100%" />
        let el = document.createElement('img');
        let sel = d3.select(el);
        sel.attr('src',"img/sub.png");
        sel.attr('width','100%');
        sel.attr('height','100%');

        this.state={el,sel,container:props.container};
        return this
    }

    getComp() {
        return this.state.el
    }
}

