<p align="center">
  <a href="https://forwardigital.co.uk/" target="blank"><img src="https://forwardigital.co.uk/logos/logo.svg" width="350" alt="Forward Digital Logo" /></a>
</p>

# mdx-variables
This package enables you to read/extract variables that have been defined inside .mdx files. [Find out more](https://forwardigital.co.uk/blog/how-to-read-variables-from-an-mdx-file) about the use cases and how to use this package [here](https://forwardigital.co.uk/blog/how-to-read-variables-from-an-mdx-file).

---

## Getting Started
Install the package
```
npm install mdx-variables
```

---

## Using the package
1. Create an MDX file and define your variables 
   
*(mdx-example/pages/my-page.mdx)*
```mdxjs
const metadata = {
    author: 'Reece Charsville',
    date: new Date('2021-06-09T12:00:00.000Z'),
    tags: ['hello', 'world']
}


### This is my markdownX file
I can create my markdown file here using the metadata variable we defined.

<TagsComponent tags={metadata.tags} />
    
<Footer author={metadata.author} date={metadata.date} />
```

2. Now we can create our React component and extract the metadata 
   
*(mdx-example/blog-index.tsx)*
```tsx
import * as React from "react";
import { ReadVarFromMDX } from "mdx-variables";

type MDXTypes = {
    tags: Array<string>;
    author: string;
    date: Date;
}

const BlogIndex: React.FC = ({ children }): JSX.Element => {
    const [meta, setMeta] = React.useState<MDXTypes>();
    const [metaFromFile, setMetaFromFile] = React.useState<MDXTypes>();
    
    React.useEffect(() => {
        // This example uses a string value of the filename as the source
        const meta: MDXTypes = ReadVarFromMDX<MDXTypes>('metadata', 'pages', 'my-page.mdx');
        setMeta(meta);

        // This example uses an .mdx file buffer as the source
        const source: Buffer = fs.readFileSync('C:/mdx-example/pages/my-page.mdx');
        const metaFile: MDXTypes = ReadVarFromMDX<MDXTypes>('metadata', 'pages', source);
        setMetaFromFile(metaFile);
    }, []);
    
    return (
        <>
            <TagsComponent tags={meta?.tags} />
            <div>
                {children}
            </div>
            <div>{metaFile?.author} - {metaFile?.date}</div>
        </>
    );
};
export default BlogIndex;

```

---

## API


### ReadVarFromMDX(variable, path, source)

| Parameter | Type | Description |
| --- | --- | --- | 
| variable | string | The name of the variable that is defined inside the markdown file. Variable definitions must be defined using ``const`` or ``let``.  |
| path | string | The path from the project root to the directory where the markdown file is located.  |
| source | string &#124; Buffer | Either a string value representing the name of the markdown file including the .mdx extension ``"filename.mdx"`` or a file buffer for the mdx file.   

---

### NOTE
If you are going to use this package with Next.js then you may want to use [superjson](https://github.com/blitz-js/babel-plugin-superjson-next). Next.js by default does not parse JS Date objects into component props. This means that variables inside the .mdx files containing JS Date objects can not be read/extracted without using superjson. You can read more about this Next.js limitation [here](https://github.com/vercel/next.js/discussions/11498).

**To use superjson with Next.js** 
1. Install the following packages:
```
npm install babel-loader babel-plugin-superjson-next superjson
```

2. Create or edit the ``.babelrc`` file and add the following:
```tsx
{
  presets: ["next/babel"],
  plugins: [
    "superjson-next"
  ]
}
```
