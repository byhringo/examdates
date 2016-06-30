import React from "react";

import FacultyList from "./FacultyList.js";
import SearchField from "./SearchField.js";
import SemesterButton from "./SemesterButton.js";

export default class FilterMenu extends React.Component {
	render(){
		var faculties = [];

		for(var key in this.props.faclist){
			faculties.push(<FacultyList	key={key}
										code={key}
										faculty={this.props.faclist[key]}
										notifyInstituteToggle={this.props.notifyInstituteToggle}
										notifyFacultyToggle={this.props.notifyFacultyToggle}
										layoutobj={this.props.layoutobj} />);
		}

		return (
			<div className="filtermenu">
				<SemesterButton 
				activeSemester={this.props.activeSemester}
				semester1={this.props.semester1}
				semester2={this.props.semester2}
				notifySemesterToggle={this.props.notifySemesterToggle.bind(this.props.layoutobj)} />

				<SearchField />

				{faculties}			
			</div>
		);
	}
}