import aZoneLogoBlueYimn from "@images/aZone-logo-blue-yinmn.png";
import MediumButton from "./MediumButton";

function ErrorPanel({ errorCode, errorMessage, errorDescription, homePageLink
}: {
	errorCode: string, errorMessage: string, errorDescription: string, homePageLink: string
}) {
	return (
		<div className="bg-white p-8 basis-4xl rounded-6xl items-center flex flex-col gap-y-8 mx-6">
			<div className="flex flex-col items-center gap-y-4">

				<img src={aZoneLogoBlueYimn} width="153" />
				<div className="flex flex-col items-center text-black text-center text-wrap">

					<h1 className="text-blue-yinmn font-bold">{errorCode}</h1>
					<div className="flex flex-col items-center gap-y-2">
						<h2 className="font-semibold">{errorMessage}</h2>
						<p className="text-base">
							{errorDescription}
						</p>
					</div>

				</div>

			</div>
			<MediumButton buttonText="Home" link={homePageLink} />

		</div>
	);
}

export function Error500Panel({ homePageLink }: { homePageLink: string }) {
	return (
		<ErrorPanel errorCode="500" errorMessage="An Internal Server Error Occured!"
			errorDescription="Oops! Something has happened to us. We apologize for the inconvenience. Please try again later or return our main page."
			homePageLink={homePageLink} />
	)
}

export function Error404Panel({ homePageLink }: { homePageLink: string }) {
	return (
		<ErrorPanel errorCode="404" errorMessage="Was something supposed to be here?"
			errorDescription="We looked everywhere, even under the couch cushions. No page found."
			homePageLink={homePageLink} />
	);
}
