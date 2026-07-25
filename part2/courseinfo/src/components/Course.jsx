const Course = ({ course }) => {
  return (
    <div>
      <Header course={course.name} />
      <Content parts={course.parts} />
      <Total parts={course.parts} />
    </div>
  );
};

const Header = (props) => <h1>{props.course}</h1>;

const Content = (props) => (
  <div>
    <Parts parts={props.parts} />
  </div>
);

const Part = (props) => (
  <p>
    {props.part.name} {props.part.exercises}
  </p>
);

const Parts = ({ parts }) => {
  return (
    <>
      {parts.map((val, i) => (
        <Part key={i} part={val} />
      ))}
    </>
  );
};

const Total = ({ parts }) => {
  const sum = parts.reduce((acc, part) => acc + part.exercises, 0);
  return (
    <b>
      <p>total of {sum} exercises</p>
    </b>
  );
};

export default Course;
