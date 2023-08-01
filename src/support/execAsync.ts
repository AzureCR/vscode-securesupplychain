import * as stream from 'stream';
import { AccumulatorStream} from './AccumulatorStream';
import {spawnStreamAsync, StreamSpawnOptions, Shell } from './spawnStreamAsync';

type Progress = (content: string, err: boolean) => void;

export type ExecAsyncOutput = { stdout: string, stderr: string };

export async function execAsync(command: string, progress?: Progress): Promise<ExecAsyncOutput> {
    const stdoutFinal = new AccumulatorStream(); /** this class: This can be useful for capturing and processing the output of asynchronous operations and handling the data once it is available. */
    const stderrFinal = new AccumulatorStream();

    let stdoutIntermediate: stream.PassThrough | undefined;
    let stderrIntermediate: stream.PassThrough | undefined;
    if (progress) {
        stdoutIntermediate = new stream.PassThrough();
        stdoutIntermediate.on('data', (chunk: Buffer) => {
            try {
                progress(bufferToString(chunk), false);
            } catch {
                // Best effort
            }
        });
        stdoutIntermediate.pipe(stdoutFinal);

        stderrIntermediate = new stream.PassThrough();
        stderrIntermediate.on('data', (chunk: Buffer) => {
            try {
                progress(bufferToString(chunk), true);
            } catch {
                // Best effort
            }
        });
        stderrIntermediate.pipe(stderrFinal);
    }

    const spawnOptions: StreamSpawnOptions = {
        shell: true,
        shellProvider: Shell.getShellOrDefault(),
        stdOutPipe: stdoutIntermediate ?? stdoutFinal,
        stdErrPipe: stderrIntermediate ?? stderrFinal,
    };

    await spawnStreamAsync(command, [], spawnOptions);

    return {
        stdout: await stdoutFinal.getString(),
        stderr: await stderrFinal.getString(),
    };
}

export function bufferToString(buffer: Buffer): string {
    // Remove non-printing control characters and trailing newlines
    // eslint-disable-next-line no-control-regex
    return buffer.toString().replace(/[\x00-\x09\x0B-\x0C\x0E-\x1F]|\r?\n$/g, '');
}
