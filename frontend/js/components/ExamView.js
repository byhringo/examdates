import React from "react";

import ExamEntry from "./ExamEntry.js";

export default class ExamView extends React.Component {
	render(){
		var exams = [];

		for(var i = 0; i < this.props.examlist.length; i++){
			var exam = this.props.examlist[i];

			var included = (this.props.filter.indexOf(exam.semester) >= 0) && (this.props.filter.indexOf(exam.institute) >= 0);

			if(included){
				exams.push(<ExamEntry 
					key={exam._id}
					obj={exam}
					/>);
			}
		}

		if(exams.length == 0){
			exams.push(<p>Ingen eksamener stemmer med dette filteret. Prøv igjen :)</p>);
		}

		return (
			<div className="examview">
				{exams}
			</div>
		);
	}
}