[Linner](https://linner-docs.vercel.app/) is an opinionated timeline component for React. You can read more about why and how it was built [here](https://medium.com/@aminahmadydeveloper/building-a-timeline-component-7c26df4445e6).

## Usage

To start using the library, install it in your project:

```bash
npm install linner
```

Add `<Linner />` to your page, it will be the place a timeline for you, that simple!
After that you can add `<LinnerTime />` as children and see props and customize your time line as you like.

```jsx
import { Linner, LinnerTime } from 'linner';

const times = [
  {
    title: 'Amin Ahmady',
    description: '...',
    date: {
      from: 'December 1',
      to: 'now',
    },
    iconVariant:"PlusIcon"
  },
  {
    title: 'Shadcn',
    description: '...',
    date: {
      from: 'November 1',
      to: 'now',
    },
    iconVariant:"CheckedIcon"
  },
];

function App() {
  return (
    <div>
      <Linner>
        {times.map(time => (
          <LinnerTime
            key={time.title}
            variant="default"
            {...time}
          />
        ))}
      </Linner>
    </div>
  );
}
```

## Documentation

You can find out more about the API and implementation in the [Documentation](https://linner-docs.vercel.app//getting-started).
