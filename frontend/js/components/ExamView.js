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

	matchesSearchTerm(exam){
		var splitTerm = this.props.searchterm.toLowerCase().split(/[ ,]+/);

		var strings = [exam.coursecode.toLowerCase(), exam.coursename.toLowerCase()];
		var rexps = [];

		splitTerm.forEach(term=>{
			if(term.length > 0){
				try{
					var reTerm = new RegExp(term);
					rexps.push(reTerm);
				} catch (e){}
			}
		});

		for(var i = 0; i < rexps.length; i++){
			for(var j = 0; j < strings.length; j++){
				if(rexps[i].test(strings[j])){
					return true;
				}
			}
		}

		return false;
	}

	render(){
		var exams = [];
		var htmlexams = [];
		
		for(var i = 0; i < this.props.examlist.length; i++){
			var exam = this.props.examlist[i];
			var splitfilter = this.props.filter.split(",");

			var instFilterPass = splitfilter.indexOf(exam.institute) >= 0;
			var semFilterPass = splitfilter.indexOf(exam.semester) >= 0;
			var searchTermPass = this.props.searchterm.length > 0 ? this.matchesSearchTerm(exam) : false;

			var included = (instFilterPass && semFilterPass) || searchTermPass;

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
			var noActiveFilters = this.props.filter.length == 4 && this.props.searchterm.length == 0;

			htmlexams.push(<p
					key="noresultsinfo"
					className="noresults">{noActiveFilters ? "Bruk menyen over til å finne eksamener ved UiO." : "Ingen resultater funnet."}
				</p>);

			if(noActiveFilters){
				htmlexams.push(<div
					key="link"
					className="link-wrapper">
					<p>Eller...</p>
					<p><a href="https://github.com/byhringo/examdates" target="_blank">Se koden på github</a></p>
					<p><a href="mailto:oyvindbyhring@gmail.com">Meld ifra om feil</a></p>
				</div>);
			}
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