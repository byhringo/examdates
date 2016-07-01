import React from "react";

export default class SearchField extends React.Component {
	render(){
		return (
			<input
			onChange={this.props.notifySearchFieldChange}
			type="text"
			className="searchfield"
			placeholder="Søk"></input>
		);
	}
}