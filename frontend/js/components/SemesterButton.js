import React from "react";

export default class SemesterButton extends React.Component {

	render(){
		return (
			<div className="semesterbuttoncontainer" onClick={this.props.notifySemesterToggle}>
				<div
					className="sem-button-part" 
					data-selected={this.props.activeSemester == 0 ? true : false}>
						{this.props.semester1.toUpperCase()}({this.props.sem1examcount})
				</div>
				<div
					className="sem-button-part" 
					data-selected={this.props.activeSemester == 1 ? true : false}>
						{this.props.semester2.toUpperCase()}({this.props.sem2examcount})
				</div>
			</div>
		);
	}
}