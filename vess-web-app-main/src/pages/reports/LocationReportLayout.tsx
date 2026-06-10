import PageMeta from "../../components/common/PageMeta";
import LocationReport from "../../components/dashboard/LocationReport";

export default function Home() {
  return (
    <>
      <PageMeta
        title="Lista de avaliações | VESS"
        description="Consulte, filtre e navegue pelas avaliações cadastradas no sistema VESS."
      />
      <div className="bg-white  dark:bg-gray-900">
        <LocationReport />
      </div>
    </>
  );
}
