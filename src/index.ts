import path from "path";
import fs from "fs";
import remark from "remark";
import * as remarkMdx from 'remark-mdx';
import * as remarkReact from 'remark-react';
import {VFile} from "vfile";

/**
 * Finds a defined variable inside an MDX file and returns the value of the variable found or null if not found
 * @param varName the name of the variable to look for inside the MDX file
 * @param mdxFilePath the path from the project root to the directory containing the mdx file.
 * @param source the file buffer or filename (include .mdx extension)
 * @constructor
 */
export function ReadVarFromMDX<T>(varName: string, mdxFilePath: string, source: Buffer | string): T {
    const file: Buffer = source instanceof Buffer ? source : ReadFile(source, mdxFilePath);
    const mdxAsVFile: VFile = remark().use(remarkMdx.default).processSync(file);
    const reactCompVFile: any = remark().use(remarkReact.default).processSync(mdxAsVFile.contents);

    if(reactCompVFile?.result?.props?.children) {
        const matches = reactCompVFile.result.props.children
            .reduce((acc, curr) => acc.concat(ChildReducer(curr, varName)), []);

        if(matches.length > 0) {
            let variableData;
            const matchSingleLine: string = matches[0];
            const equalsPos: number = matchSingleLine.indexOf('=');
            const objString = matchSingleLine.substring(equalsPos+1);
            const varDec = `variableData = ${objString};`;
            eval(varDec);
            return variableData;
        }
    }

    return null;
}

/**
 * Check if the child is a component with children or a string, if its a component then pass in that components children
 * @param child
 * @param varName
 * @constructor
 */
function ChildReducer(child: any, varName: string): Array<string> {
    const item = typeof child === 'string' ? child : child?.props?.children
    return IncludesVariableDefinition(item, varName);
}

/**
 * Get the file buffer for an mdx file at the path supplied
 * @param filename
 * @param mdxFilePath
 * @constructor
 */
function ReadFile(filename: string, mdxFilePath: string): Buffer {
    const fullFileDirectoryPath: string = path.join(process.cwd(), mdxFilePath);
    if(!/\.mdx?$/.test(filename)) throw new Error('source must be an MDX file path or MDX file buffer');
    const fullFilePath: string = path.join(fullFileDirectoryPath, filename);
    return fs.readFileSync(fullFilePath);
}

/**
 * Check if the passed in component or array of components contains the variable, if matches are found return them
 * @param component
 * @param varName
 * @constructor
 */
function IncludesVariableDefinition(component: any | Array<any> | null, varName: string): Array<string> {
    if(component === null) return [];
    const children: Array<any> = typeof component === 'string' ? [component] : component;
    return children
        .filter(c => typeof c === 'string' && (c?.includes(`const ${varName} = {`) || c?.includes(`let ${varName} = {`)))
        .map(c => c.indexOf('export') === 0 ? c.substring(7) : c);
}

module.exports = {
    ReadVarFromMDX
};
