import React from "react";

import ExamView from "./ExamView.js";
import FilterMenu from "./FilterMenu.js";

const preview = false;
const userInputDelay = 250;

export default class Layout extends React.Component {
	constructor(){
		super();
		//Load the exams
		this.state = {
			examlist: {}, 
			faclist: {}, 
			semester1: "Oops!",
			sem1examcount: 0,
			semester2: "Something failed.",
			sem2examcount: 0,
			activeSemester: 0, 
			filter: "", 
			searchterm: ""};

		var reactobj = this;

		//Used to prevent the search term from updating too fast
		this.updateID = 0;

		$.getJSON("/api/getexams/", function(data){
			reactobj.setState({examlist: data});

			var s1 = 0;
			var s2 = 0;

			data.forEach(exam=>{
				if(exam.semester == reactobj.state.semester1){
					s1++;
				}
				if(exam.semester == reactobj.state.semester2){
					s2++;
				}
			});

			reactobj.setState({sem1examcount: s1, sem2examcount: s2});
		});

		//Load the faculty list
		$.getJSON("/api/getfacultyjson/", function(data){
			// Loop through all faculties and add an array that indicates if
			// exams from the institutes should be shown.
			for(var key in data){
				data[key].instituteFilter = [];

				for(var i = 0; i < data[key].institutes.length; i++){
					data[key].instituteFilter[i] = false;
				}
			}

			reactobj.setState({faclist: data});
		});

		$.getJSON("api/getsemesters", function(data){
			reactobj.setState({semester1: data.semester1, semester2: data.semester2}, reactobj.rebuildFilter);
		});
	}

	rebuildFilter(){
		var filter = preview ? "ifi" : "";

		//Add the semester filter
		filter = filter.concat((this.state.activeSemester == 0 ? this.state.semester1 : this.state.semester2) + ",");

		//Loop through all institutes, add them to the filter if enabled
		for(var key in this.state.faclist){
				for(var i = 0; i < this.state.faclist[key].institutes.length; i++){
				if(this.state.faclist[key].instituteFilter[i]){
					filter = filter.concat(this.state.faclist[key].institutes[i].split("|")[0] + ",");
				};
			}
		}

		this.setState({filter: filter});
	}

	notifyInstituteToggle(facKey, instituteIndex){
		var faclist = this.state.faclist;

		//If all institutes were active, instead of turning this one off, turn off all the other ones
		if(faclist[facKey].instituteFilter.every(val=>{return val})){
			this.notifyFacultyToggle(facKey, false);
		}

		faclist[facKey].instituteFilter[instituteIndex] = !faclist[facKey].instituteFilter[instituteIndex];

		this.setState({faclist: faclist}, this.rebuildFilter);
	}

	notifyFacultyToggle(facKey, newVal){
		var faclist = this.state.faclist;

		for(var i = 0; i < faclist[facKey].instituteFilter.length; i++){
			faclist[facKey].instituteFilter[i] = newVal;
		}

		this.setState({faclist: faclist}, this.rebuildFilter);
	}

	notifySemesterToggle(){
		this.setState({activeSemester: this.state.activeSemester == 0 ? 1 : 0}, this.rebuildFilter);
	}

	//Update the search term if the user has not made any additional changes within the last <userInputDelay> seconds
	notifySearchFieldChange(e){
		var updateSearchTerm = (newTerm, uid)=>{
			if(uid == this.updateID){
				this.setState({searchterm: newTerm});
			}
		}
		//Prevents integer overflow errors :)
		this.updateID = (this.updateID + 1) % 10000;

		setTimeout(updateSearchTerm.bind(this, e.target.value, this.updateID), userInputDelay);
	}

	render(){
		return (
			<div className="wrapper-all">
				<FilterMenu
					faclist={this.state.faclist}
					semester1={this.state.semester1}
					sem1examcount={this.state.sem1examcount}
					semester2={this.state.semester2}
					sem2examcount={this.state.sem2examcount}
					activeSemester={this.state.activeSemester}
					layoutobj={this}
					notifyInstituteToggle={this.notifyInstituteToggle}
					notifyFacultyToggle={this.notifyFacultyToggle}
					notifySemesterToggle={this.notifySemesterToggle}
					notifySearchFieldChange={this.notifySearchFieldChange.bind(this)} />

					
				<ExamView
					examlist={this.state.examlist}
					filter={this.state.filter}
					searchterm={this.state.searchterm} />
			</div>
		);
	}
}