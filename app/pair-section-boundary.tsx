import {Component,type ReactNode} from 'react';

// Contain rendering failures without logging private records or resetting data.
export class PairSectionBoundary extends Component<{children:ReactNode;onBack:()=>void},{failed:boolean}>{
 state={failed:false};
 static getDerivedStateFromError(){return {failed:true};}
 render(){
  if(!this.state.failed)return this.props.children;
  return <section className="card" role="alert"><h2>No pudimos abrir Pareja</h2><p>Tus datos no se borraron. Podés volver a tu espacio personal.</p><button className="soft-button" onClick={()=>this.setState({failed:false})}>Reintentar</button><button className="soft-button" onClick={this.props.onBack}>Volver a Personal</button></section>;
 }
}
