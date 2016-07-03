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

	getDateString(d, withDate){
		//Fix leading zeroes
		var hours = d.getHours();
		hours = (hours < 10 ? "0" : "") + hours;
		var minutes = d.getMinutes();
		minutes = (minutes < 10 ? "0" : "") + minutes;

		var dateString = d.getDate() + " " + this.monthNames[d.getMonth()];

		return (withDate ? dateString : "") + " kl. " + hours + ":" + minutes;
	}

	render(){
		var singledate = this.props.obj.end == null;
		var dStart = new Date(this.props.obj.start);
		var dEnd = (singledate ? null : new Date(this.props.obj.end));

		var pcontent = this.getDateString(dStart, false);


		if(!singledate){
			pcontent += " til " + this.getDateString(dEnd, true);
		}

		return (
			<div className="examentry">
				<h3>{this.props.obj.coursecode + " - " + this.props.obj.coursename}</h3>
				<p className="info">{this.props.obj.info}</p>
				<div className="time-links-wrapper">
					<time>{pcontent}</time>
					<a href={this.props.obj.exampageurl} target="_blank">Eksamensside</a>
				</div>
			</div>
		);
	}
}