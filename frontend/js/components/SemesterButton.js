import React from "react";

export default class SemesterButton extends React.Component {

	render(){
		return (
			<div className="semesterbuttoncontainer" onClick={this.props.notifySemesterToggle}>
				<div className={this.props.activeSemester == 0 ? "selected" : ""}>{this.props.semester1}</div>
				<div className={this.props.activeSemester == 1 ? "selected" : ""}>{this.props.semester2}</div>
			</div>
		);
	}
}