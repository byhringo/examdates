import React from "react";

/*
Props:
key=<faculty code string>
institutes=<array of institutes in form: "code|displayname"
displayname=<display name string>
*/
export default class FacultyList extends React.Component {
	toggleEntireFaculty(e){
		var allDisabled = true;
		for(var i = 0; i < this.props.faculty.institutes.length; i++){
			allDisabled = allDisabled && !this.isActive(i);
		}

		for(var i = 0; i < this.props.faculty.institutes.length; i++){
			this.props.notifyFacultyToggle.call(this.props.layoutobj, this.props.code, allDisabled);
		}
	}

	isActive(index){
		return this.props.faculty.instituteFilter[index];
	}

	render(){
		var allInactive = true;

		//Check if any institutes were active. If any were active, make header green
		//If none were active, make header red
		for(var i = 0; i < this.props.faculty.institutes.length; i++){
			allInactive = allInactive && !this.isActive(i);
		}

		//var allInactive = this.props.faculty.institutes.every((faculty, i) => this.isActive(i));

		var listitems = [];

		//Setup the institutes that belong to this faculty
		for(var i = 0; i < this.props.faculty.institutes.length; i++){
			var inst = this.props.faculty.institutes[i];

			//Add the institute to the list, with an onClick to toggle "active"
			listitems.push(<li
				onClick={this.props.notifyInstituteToggle.bind(this.props.layoutobj, this.props.code, i)}
				key={inst.split("|")[0]}
				data-selected={this.isActive(i) ? true : false}>
				{inst.split("|")[1]}
				</li>);
		}

		return (
			<div
			className="faculty"
			data-selected={allInactive ? false : true}>
				<div
				role="button"
				className="title"
				onClick={this.toggleEntireFaculty.bind(this)}
				>{this.props.faculty.displayname}</div>
				<ul className="list">
					{listitems}
				</ul>
			</div>
		);
	}
}