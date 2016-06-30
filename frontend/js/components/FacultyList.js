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

		var headerStyle = {backgroundColor: allInactive ? "#ffbbbb" : "#bbffbb"};

		var listitems = [];

		//Setup the institutes that belong to this faculty
		for(var i = 0; i < this.props.faculty.institutes.length; i++){
			var inst = this.props.faculty.institutes[i];
			//Check if this institute is "active"
			var liStyle = {backgroundColor: this.isActive(i) ? "#bbffbb" : "#ffbbbb"};
			//Add the institute to the list, with an onClick to toggle "active"
			listitems.push(<li
				onClick={this.props.notifyInstituteToggle.bind(this.props.layoutobj, this.props.code, i)}
				key={inst.split("|")[0]}
				style={liStyle}>
				{inst.split("|")[1]}
				</li>);
		}

		return (
			<div className="faculty">
				<h1 onClick={this.toggleEntireFaculty.bind(this)} style={headerStyle}>{this.props.faculty.displayname}</h1>
				<ul className="facultylist">
					{listitems}
				</ul>
			</div>
		);
	}
}