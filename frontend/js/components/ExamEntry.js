import React from "react";

export default class ExamEntry extends React.Component {
	constructor(){
		super();
		this.monthNames = [
		  "Januar", "Februar", "Mars",
		  "April", "Mai", "Juni", "Juli",
		  "August", "September", "Oktober",
		  "November", "Desember"
		];
	}

	getDateString(d){
		//Fix leading zeroes
		var hours = d.getHours();
		hours = (hours < 10 ? "0" : "") + hours;
		var minutes = d.getMinutes();
		minutes = (minutes < 10 ? "0" : "") + minutes;

		var singledate = this.props.obj.end == "";

		return d.getDate() + " " + this.monthNames[d.getMonth()] + " kl. " + hours + ":" + minutes;
	}

	render(){
		

		var singledate = this.props.obj.end == "";
		var dStart = new Date(this.props.obj.start);
		var dEnd = (singledate ? null : new Date(this.props.obj.end));

		var pcontent = this.getDateString(dStart);

		if(!singledate){
			pcontent += " til " + this.getDateString(dEnd);
		}

		return (
			<div className="examentry">
				<h3>{this.props.obj.coursecode + " - " + this.props.obj.coursename}</h3>
				<h4>{this.props.obj.info}</h4>
				<p>{pcontent}</p>
			</div>
		);
	}
}