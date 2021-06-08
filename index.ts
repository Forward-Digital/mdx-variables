import path from "path";
import fs from "fs";
import remark from "remark";
import * as remarkMdx from 'remark-mdx';
import * as remarkReact from 'remark-react';

/**
 * Finds a defined variable inside an MDX file and returns the value of the variable found or null if not found
 * @param varName the name of the variable to look for inside the MDX file
 * @param mdxFilePath the path from the project root to the directory containing the mdx file.
 * @param source the file buffer or filename (incl. .mdx extension)
 * @constructor
 */
export function ReadVarFromMDX(varName: string, mdxFilePath: string, source: Buffer | string): any {
    let file;
    const fullFileDirectoryPath: string = path.join(process.cwd(), mdxFilePath);
    if(source instanceof Buffer) {
        file = source;
    } else {
        if(!/\.mdx?$/.test(source)) Promise.reject('source must be an MDX file path or MDX file buffer');
        const fullFilePath: string = path.join(fullFileDirectoryPath, source);
        file = fs.readFileSync(fullFilePath);
    }

    const mdxAsVFile: any = remark().use(remarkMdx.default).processSync(file);
    const reactCompVFile: any = remark().use(remarkReact.default).processSync(mdxAsVFile.contents);

    if(reactCompVFile?.result?.props?.children) {
        const matches = [];
        for(const childComp of reactCompVFile.result.props.children) {
            if(childComp?.props?.children) {
                for(const child of childComp.props.children) {
                    if(typeof child === 'string') {
                        if(child?.includes(`const ${varName} = {`) || child?.includes(`let ${varName} = {`)) {
                            if(child.indexOf('export') === 0) matches.push(child.substring(7));
                            else matches.push(child);
                        }
                    }
                }
            }
        }
        if(matches.length > 0) {
            var variableData;
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

module.exports = {
    ReadVarFromMDX
};
