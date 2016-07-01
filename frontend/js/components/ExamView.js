import React from "react";

import ExamEntry from "./ExamEntry.js";

export default class ExamView extends React.Component {
	constructor(){
		super();
		this.monthNames = [
		  "Januar", "Februar", "Mars",
		  "April", "Mai", "Juni", "Juli",
		  "August", "September", "Oktober",
		  "November", "Desember"
		];
	}

	isSameDay(date1, date2){
		return (date1.getDate() == date2.getDate()) && (date1.getMonth() == date2.getMonth()) && (date1.getYear() == date2.getYear());
	}

	calcDayOfYear(date){
		var startOfYear = new Date(date.getFullYear(), 0, 0);
		var diff = date - startOfYear;
		return Math.floor(diff/(1000*60*60*24));
	}

	createDateLabel(date){
		return (<div 
			key={"label_" + date.toString()}
			className="datelabel">{date.getDate() + " " + this.monthNames[date.getMonth()]}</div>);
	}

	createExamEntry(exam){
		return (<ExamEntry
			key={exam._id}
			className="examentry"
			obj={exam}
			/>);
	}

	matchesSearchFilter(exam){
		var matchCode = false;
		var matchName = false;
		try{
			var reTerm = new RegExp(this.props.searchterm.toLowerCase());

			var matchCode = reTerm.test(exam.coursecode.toLowerCase());
			var matchName = reTerm.test(exam.coursename.toLowerCase());
		} catch (e){
			//Not a valid regexp. Try matching another way.
			var matchCode = this.props.searchterm.toLowerCase().indexOf(exam.coursecode.toLowerCase()) >= 0;
			var matchName = this.props.searchterm.toLowerCase().indexOf(exam.coursename.toLowerCase()) >= 0;
		}

		return matchCode || matchName;
	}

	render(){
		var exams = [];
		var htmlexams = [];

		for(var i = 0; i < this.props.examlist.length; i++){
			var exam = this.props.examlist[i];

			var instFilterPass = this.props.filter.indexOf(exam.institute) >= 0;
			var semFilterPass = this.props.filter.indexOf(exam.semester) >= 0;
			var searchFilterPass = this.props.searchterm.length > 0 ? this.matchesSearchFilter(exam) : false;

			var included = (instFilterPass && semFilterPass) || searchFilterPass;

			if(included){
				exams.push(exam);
			}
		}

		if(exams.length > 0){
			var firstDate = new Date(exams[0].start);
			var lastDate = new Date(exams[exams.length-1].start);

			var totalDays = this.calcDayOfYear(lastDate) - this.calcDayOfYear(firstDate) + 1;
			var currentDate = firstDate;
			var examsIndex = 0;

			for(var i = 0; i < totalDays; i++){
				var tempExams = [];
				//Add all exams for this date
				while(this.isSameDay(new Date(exams[examsIndex].start), currentDate)){
					tempExams.push(this.createExamEntry(exams[examsIndex]));
					examsIndex++;

					if(examsIndex == exams.length){
						i = totalDays;
						break;
					}
				}

				//Only add a list element if there are exams on this date
				if(tempExams.length > 0){
					htmlexams.push(<li key={"li_" + currentDate.toString()}>{this.createDateLabel(currentDate)}<div className="exam-wrapper">{tempExams}</div></li>);
				}
				//Increment the day by 1 after adding all exams for this day
				currentDate.setDate(currentDate.getDate()+1);
			}
		} else{
			exams.push(<p>Ingen eksamener stemmer med dette filteret. Prøv igjen :)</p>);
		}

		return (
			<div className="examview">
				<ul>
					{htmlexams}
				</ul>
			</div>
		);
	}
}