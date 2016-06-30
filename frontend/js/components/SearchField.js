import React from "react";

export default class SearchField extends React.Component {
	handleChange(e){
		const searchTerm = e.target.value;
	}

	render(){
		return (
			<input onChange={this.handleChange.bind(this)} type="text" className="searchfield"></input>
		);
	}
}