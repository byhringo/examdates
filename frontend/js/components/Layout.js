import React from "react";
import update from "react-addons-update";

import ExamView from "./ExamView.js";
import FilterMenu from "./FilterMenu.js";

const preview = false;


export default class Layout extends React.Component {
	constructor(){
		super();
		//Load the exams
		this.state = {
			examlist: {}, 
			faclist: {}, 
			semester1: "foo",
			semester2: "bar",
			activeSemester: 0, 
			filter: "", 
			searchterm: ""};

		var reactobj = this;

		$.getJSON("/api/getexams/", function(data){
			reactobj.setState({examlist: data});
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

	notifySearchFieldChange(e){
		this.setState({searchterm: e.target.value});
	}

	render(){
		return (
			<div>
				<FilterMenu
					faclist={this.state.faclist}
					semester1={this.state.semester1}
					semester2={this.state.semester2}
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